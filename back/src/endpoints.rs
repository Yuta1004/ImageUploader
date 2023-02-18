use actix_web::http::StatusCode;
use actix_web::{get, post, put, delete, web, HttpRequest, HttpResponse, Responder};
use actix_multipart::Multipart;
use futures::{StreamExt, TryStreamExt};
use serde::{Serialize, Deserialize};

use crate::{mysql, s3};

#[derive(Serialize)]
struct AlbumPubInfo {
    id: String,
    name: String,
    writable: bool,
    removable: bool,
    last_update: String,
    files: Vec<String>,
}

impl AlbumPubInfo {
    pub fn from(album: mysql::model::Album, files: Vec<String>) -> AlbumPubInfo {
        AlbumPubInfo {
            id: album.id,
            name: album.name,
            writable: album.writable,
            removable: album.removable,
            last_update: album.last_update,
            files
        }
    }
}

#[derive(Deserialize)]
struct NewAlbumForm {
    name: String,
    writable: bool,
    removable: bool,
    passphrase: String
}

fn get_album(album_id: &str, passphrase: &str) -> Result<mysql::model::Album, HttpResponse> {
    let album = match mysql::check_album(&album_id.to_string()) {
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

    if &album.passphrase == passphrase {
        Ok(album)
    } else {
        Err(HttpResponse::build(StatusCode::UNAUTHORIZED)
            .body("Passphrase may be wrong.")
        )
    }
}

#[get("/album")]
async fn get_all_albums() -> impl Responder {
    match mysql::get_all_albums() {
        Ok(albums) => {
            let albums = albums
                .into_iter()
                .map(|album| AlbumPubInfo::from(album, vec![]))
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
async fn create_album(form: web::Form<NewAlbumForm>) -> impl Responder {
    match mysql::create_album(&form.name, form.writable, form.removable, &form.passphrase) {
        Ok(album_id) => HttpResponse::build(StatusCode::OK)
            .body(album_id),
        Err(_) => HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!")
    }
}

#[get("/album/{album}")]
async fn get_image_list_in_album(req: HttpRequest) -> impl Responder {
    let passphrase = match req.headers().get("IU-Passphrase") {
        Some(passphrase) => passphrase.to_str().unwrap(),
        None => return HttpResponse::build(StatusCode::BAD_REQUEST)
            .body("Passphrase is not given.")
    };

    let album_id = req.match_info().get("album").unwrap();
    let album = match get_album(&album_id, passphrase) {
        Ok(album) => album,
        Err(resp) => return resp
    };

    let files = s3::get_file_list(&format!("/{}", album_id)).await.unwrap();
    HttpResponse::build(StatusCode::OK)
        .content_type("application/json")
        .json(AlbumPubInfo::from(album, files))
}

#[put("/album/{album}")]
async fn upload_image_to_album(req: HttpRequest, mut payload: Multipart) -> impl Responder {
    let passphrase = match req.headers().get("IU-Passphrase") {
        Some(passphrase) => passphrase.to_str().unwrap(),
        None => return HttpResponse::build(StatusCode::BAD_REQUEST)
            .body("Passphrase is not given.")
    };

    let album_id = req.match_info().get("album").unwrap().to_owned();
    match get_album(&album_id, passphrase) {
        Ok(album) => if !album.writable {
            return HttpResponse::build(StatusCode::UNAUTHORIZED)
                .body("Not allowed to put images to this album.")
        },
        Err(resp) => return resp
    };

    while let Ok(Some(mut field)) = payload.try_next().await {
        let mut body = web::BytesMut::new();
        while let Some(chunk) = field.next().await {
            body.extend_from_slice(&chunk.unwrap())
        }
        let filename = field.name();

        s3::save_file(
            &format!("{}/{}", &album_id, filename),
            body.to_vec()
        ).await.unwrap();
    }

    HttpResponse::build(StatusCode::OK).body(album_id)
}

#[delete("/album/{album}")]
async fn remove_album(req: HttpRequest) -> impl Responder {
    let passphrase = match req.headers().get("IU-Passphrase") {
        Some(passphrase) => passphrase.to_str().unwrap(),
        None => return HttpResponse::build(StatusCode::BAD_REQUEST)
            .body("Passphrase is not given.")
    };

    let album_id = req.match_info().get("album").unwrap().to_owned();
    match get_album(&album_id, passphrase) {
        Ok(album) => if !album.removable {
            return HttpResponse::build(StatusCode::UNAUTHORIZED)
                .body("Not allowed to remove a image in this album.")
        },
        Err(resp) => return resp
    };

    match mysql::remove_album(&album_id) {
        Ok(_) => HttpResponse::build(StatusCode::OK)
            .body(album_id),
        Err(_) => HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!")
    }
}

#[get("/album/{album}/{file:.*}")]
async fn get_image_in_album(req: HttpRequest) -> impl Responder {
    let passphrase = match req.headers().get("IU-Passphrase") {
        Some(passphrase) => passphrase.to_str().unwrap(),
        None => return HttpResponse::build(StatusCode::BAD_REQUEST)
            .body("Passphrase is not given.")
    };

    let album_id = req.match_info().get("album").unwrap();
    if let Err(resp) = get_album(album_id, passphrase) {
        return resp;
    }

    let path = req.uri().path().replace("/album", "");
    match s3::get_file(&path).await {
        Ok((mime, body)) =>
            HttpResponse::build(StatusCode::OK)
                .content_type(mime)
                .body(body),
        Err(_) =>
            HttpResponse::build(StatusCode::NOT_FOUND)
                .body("The specified file is not found.")
    }
}

#[delete("/album/{album}/{file:.*}")]
async fn remove_image_in_album(req: HttpRequest) -> impl Responder {
    let passphrase = match req.headers().get("IU-Passphrase") {
        Some(passphrase) => passphrase.to_str().unwrap(),
        None => return HttpResponse::build(StatusCode::BAD_REQUEST)
            .body("Passphrase is not given.")
    };

    let album_id = req.match_info().get("album").unwrap();
    if let Err(resp) = get_album(album_id, passphrase) {
        return resp;
    }

    let path = req.uri().path().replace("/album", "");
    match s3::remove_file(&path).await {
        Ok(_) =>
            HttpResponse::build(StatusCode::OK)
                .body(path),
        Err(_) =>
            HttpResponse::build(StatusCode::NOT_FOUND)
                .body("The specified file is not found.")
    }
}
