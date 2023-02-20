use std::env;

use actix_web::http::StatusCode;
use actix_web::cookie::Cookie;
use actix_web::{get, post, put, delete, web, HttpRequest, HttpResponse, Responder};
use actix_multipart::Multipart;
use futures::{StreamExt, TryStreamExt};
use serde::{Serialize, Deserialize};

use crate::s3;
use crate::mysql::{album, item};

#[derive(Serialize)]
struct AlbumPubInfo {
    // 基本情報
    id: String,
    name: String,
    writable: bool,
    removable: bool,
    last_updated_at: String,
    items_count: i32,

    // アイテム
    images: Vec<String>,                    // name, path
    youtube_movies: Vec<(String, String)>   // name, id
}

impl AlbumPubInfo {
    pub fn from(album: album::model::Album, items: (Vec<item::model::Item>, Vec<item::model::Item>)) -> AlbumPubInfo {
        let (images, youtube_movies) = items;
        let images = images
            .into_iter()
            .map(|item| item.name)
            .collect();
        let youtube_movies = youtube_movies
            .into_iter()
            .map(|item| (item.name, item.path))
            .collect();

        AlbumPubInfo {
            id: album.id,
            name: album.name,
            writable: album.writable,
            removable: album.removable,
            last_updated_at: album.last_updated_at,
            items_count: album.items_count,
            images,
            youtube_movies
        }
    }
}

#[derive(Deserialize)]
struct CreateAlbumForm {
    name: String,
    writable: bool,
    removable: bool,
    passphrase: String
}

fn get_album(req: &HttpRequest) -> Result<album::model::Album, HttpResponse> {
    let album_id = req.match_info().get("album").unwrap();
    let album = match album::get_album(album_id) {
        Ok(Some(album)) => album,
        Ok(None) => return Err(
            HttpResponse::build(StatusCode::NOT_FOUND)
                .body("The specified album is not found.")
        ),
        Err(_) => return Err(
            HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
                .body("Unknown Error occured!")
        )
    };

    let passphrase = match req.headers().get("cookie") {
        Some(cookies) => {
            let passphrase = cookies.to_str().unwrap().split(";").find_map(|cookie| {
                let cookie = Cookie::parse(cookie).unwrap();
                if cookie.name() == "IU-Passphrase" {
                    Some(cookie.value().to_string())
                } else {
                    None 
                }
            });
            match passphrase {
                Some(passphrase) => passphrase,
                None => return Err(
                    HttpResponse::build(StatusCode::BAD_REQUEST)
                        .body("Passphrase is not given.")
                )
            }
        },
        None => return Err(
            HttpResponse::build(StatusCode::BAD_REQUEST)
                .body("Passphrase is not given.")
        )
    };

    if album.passphrase == passphrase {
        Ok(album)
    } else {
        Err(HttpResponse::build(StatusCode::UNAUTHORIZED)
            .body("Passphrase may be wrong.")
        )
    }
}

#[get("/album")]
async fn get_all_albums() -> impl Responder {
    match album::get_all_albums() {
        Ok(albums) => {
            let albums = albums
                .into_iter()
                .map(|album| AlbumPubInfo::from(album, (vec![], vec![])))
                .collect::<Vec<AlbumPubInfo>>();
            HttpResponse::build(StatusCode::OK)
                .content_type("application/json")
                .json(albums)
        },
        Err(_) => HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!")
    }
}

#[post("/album")]
async fn create_album(req: HttpRequest, form: web::Form<CreateAlbumForm>) -> impl Responder {
    match req.headers().get("IU-AdminPassword") {
        Some(admin_password) =>
            if admin_password.to_str().unwrap() != env::var("IUPLOADER_ADMIN_PASSWORD").unwrap() {
                return HttpResponse::build(StatusCode::UNAUTHORIZED)
                    .body("Admin Password may be wrong.")
            }
        None => return HttpResponse::build(StatusCode::BAD_REQUEST)
            .body("Admin Password is not given.")
    }

    match album::create_album(&form.name, form.writable, form.removable, &form.passphrase) {
        Ok(album_id) => HttpResponse::build(StatusCode::OK)
            .body(album_id),
        Err(_) => HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!")
    }
}

#[post("/album/{album}")]
async fn update_album(req: HttpRequest, form: web::Form<CreateAlbumForm>) -> impl Responder {
    match req.headers().get("IU-AdminPassword") {
        Some(admin_password) =>
            if admin_password.to_str().unwrap() != env::var("IUPLOADER_ADMIN_PASSWORD").unwrap() {
                return HttpResponse::build(StatusCode::UNAUTHORIZED)
                    .body("Admin Password may be wrong.")
            }
        None => return HttpResponse::build(StatusCode::BAD_REQUEST)
            .body("Admin Password is not given.")
    }

    let album_id = req.match_info().get("album").unwrap();
    match album::update_album(album_id, &form.name, form.writable, form.removable, &form.passphrase) {
        Ok(album_id) => HttpResponse::build(StatusCode::OK)
            .body(album_id),
        Err(_) => HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!")
    }
}

#[delete("/album/{album}")]
async fn remove_album(req: HttpRequest) -> impl Responder {
    let album = match get_album(&req) {
        Ok(album) => if !album.removable {
            return HttpResponse::build(StatusCode::UNAUTHORIZED)
                .body("Not allowed to remove a image in this album.")
        } else {
            album
        },
        Err(resp) => return resp
    };

    match album::remove_album(&album.id) {
        Ok(_) => HttpResponse::build(StatusCode::OK)
            .body(album.id),
        Err(_) => HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!")
    }
}

#[get("/album/{album}/items")]
async fn get_items_in_album(req: HttpRequest) -> impl Responder {
    let album = match get_album(&req) {
        Ok(album) => album,
        Err(resp) => return resp
    };

    match item::get_items(&album.id) {
        Ok(items) => HttpResponse::build(StatusCode::OK)
            .content_type("application/json")
            .json(AlbumPubInfo::from(album, items)),
        Err(_) => HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!")
    }
}

#[get("/album/{album}/items/image/{file:.*}")]
async fn get_image_in_album(req: HttpRequest) -> impl Responder {
    let album_id = match get_album(&req) {
        Ok(album) => album.id,
        Err(resp) => return resp
    };
    let file_name = req.match_info().get("file").unwrap();
    let file_path = format!("{}/{}", album_id, file_name);

    match s3::get_file(&file_path).await {
        Ok((mime, body)) =>
            HttpResponse::build(StatusCode::OK)
                .content_type(mime)
                .body(body),
        Err(_) =>
            HttpResponse::build(StatusCode::NOT_FOUND)
                .body("The specified file is not found.")
    }
}

#[put("/album/{album}/items/image")]
async fn upload_image_to_album(req: HttpRequest, mut payload: Multipart) -> impl Responder {
    let album = match get_album(&req) {
        Ok(album) => if !album.writable {
            return HttpResponse::build(StatusCode::UNAUTHORIZED)
                .body("Not allowed to put images to this album.")
        } else {
            album
        },
        Err(resp) => return resp
    };

    while let Ok(Some(mut field)) = payload.try_next().await {
        let mut body = web::BytesMut::new();
        while let Some(chunk) = field.next().await {
            body.extend_from_slice(&chunk.unwrap())
        }
        let filename = field.name();

        item::save_item(&album.id, item::model::ItemType::Image, filename, filename).unwrap();
        s3::save_file(
            &format!("{}/{}", &album.id, filename),
            body.to_vec()
        ).await.unwrap();
    }

    HttpResponse::build(StatusCode::OK).body(album.id)
}

#[delete("/album/{album}/items/image/{file:.*}")]
async fn remove_image_in_album(req: HttpRequest) -> impl Responder {
    let album_id = match get_album(&req) {
        Ok(album) => if !album.removable {
            return HttpResponse::build(StatusCode::UNAUTHORIZED)
                .body("Not allowed to put images to this album.")
        } else {
            album.id
        },
        Err(resp) => return resp
    };
    let file_name = req.match_info().get("file").unwrap();
    let file_path = format!("{}/{}", album_id, file_name);

    item::remove_item(&album_id, file_name).unwrap();
    match s3::remove_file(&file_path).await {
        Ok(path) =>
            HttpResponse::build(StatusCode::OK)
                .body(path),
        Err(_) =>
            HttpResponse::build(StatusCode::NOT_FOUND)
                .body("The specified file is not found.")
    }
}
