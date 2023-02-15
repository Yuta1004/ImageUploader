use actix_web::http::StatusCode;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use actix_multipart::Multipart;
use futures::{StreamExt, TryStreamExt};

use crate::s3;

#[post("/album/{album}")]
async fn upload_image_to_album(path: web::Path<(String, )>, mut payload: Multipart) -> impl Responder {
    while let Ok(Some(mut field)) = payload.try_next().await {
        let mut body = web::BytesMut::new();
        while let Some(chunk) = field.next().await {
            body.extend_from_slice(&chunk.unwrap())
        }
        let filename = field.name();

        s3::save_file(
            &format!("{}/{}", &path.0, filename),
            body.to_vec()
        ).await.unwrap();
    }

    HttpResponse::build(StatusCode::OK)
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
