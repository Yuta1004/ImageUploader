use actix_web::http::StatusCode;
use actix_web::{get, post, put, delete, web, HttpRequest, HttpResponse, Responder};
use actix_multipart::Multipart;
use futures::{StreamExt, TryStreamExt};
use serde::{Serialize, Deserialize};

use crate::{mysql, s3};

#[derive(Deserialize)]
struct NewAlbumForm {
    name: String,
    writable: bool,
    removable: bool,
    passphrase: String
}

#[post("/album")]
async fn create_album(form: web::Form<NewAlbumForm>, mut payload: Multipart) -> impl Responder {
    let album_id = match mysql::create_album(&form.name, form.writable, form.removable, &form.passphrase) {
        Ok(album_id) => album_id,
        Err(_) => return HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!")
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

#[get("/album/{album}")]
async fn get_image_list_in_album(req: HttpRequest) -> impl Responder {
    let album_id = req.uri().path().replace("/album/", "");
    match mysql::check_album(&album_id) {
        Ok(None) => return HttpResponse::build(StatusCode::NOT_FOUND)
            .body("The specified album is not found."),
        Err(_) => return HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!"),
        _ => {}
    }

    let file_list = s3::get_file_list(&format!("/{}", album_id)).await.unwrap();
    if file_list.len() > 0 {
        HttpResponse::build(StatusCode::OK)
            .content_type("application/json")
            .json(file_list)   
    } else {
        HttpResponse::build(StatusCode::NOT_FOUND)
            .body("The specified album is not found.")
    }
}

#[put("/album/{album}")]
async fn upload_image_to_album(req: HttpRequest, mut payload: Multipart) -> impl Responder {
    let album_id = req.uri().path().replace("/album/", "");
    match mysql::check_album(&album_id) {
        Ok(None) => return HttpResponse::build(StatusCode::NOT_FOUND)
            .body("The specified album is not found."),
        Err(_) => return HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!"),
        _ => {}
    }

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
    let album_id = req.uri().path().replace("/album/", "");
    match mysql::check_album(&album_id) {
        Ok(None) => return HttpResponse::build(StatusCode::NOT_FOUND)
            .body("The specified album is not found."),
        Err(_) => return HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!"),
        _ => {}
    }
    
    match mysql::remove_album(&album_id) {
        Ok(_) => HttpResponse::build(StatusCode::OK)
            .body(album_id),
        Err(_) => HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
            .body("Unknown Error occured!")
    }
}

#[get("/album/{album}/{file:.*}")]
async fn get_image_in_album(req: HttpRequest) -> impl Responder {
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
