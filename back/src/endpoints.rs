use actix_web::http::StatusCode;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use actix_multipart::Multipart;
use futures::{StreamExt, TryStreamExt};
use serde::Deserialize;

use crate::{mysql, s3};

#[derive(Deserialize)]
struct NewAlbumForm {
    name: String,
    writable: bool,
    removable: bool
}

#[post("/album")]
async fn upload_image_to_album(form: web::Form<NewAlbumForm>, mut payload: Multipart) -> impl Responder {
    let album_id = match mysql::create_album(&form.name, form.writable, form.removable) {
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
async fn get_image_list_in_album(path: web::Path<(String,)>) -> impl Responder {
    let file_list = s3::get_file_list(&path.0).await.unwrap();
    if file_list.len() > 0 {
        HttpResponse::build(StatusCode::OK)
            .content_type("application/json")
            .json(file_list)   
    } else {
        HttpResponse::build(StatusCode::NOT_FOUND)
            .body("The specified album is not found.")
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
