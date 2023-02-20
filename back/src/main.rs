mod s3;
mod mysql;
mod endpoints;

use std::env;

use actix_web::middleware::Logger;
use actix_web::{App, HttpServer};

#[tokio::main]
async fn main() -> std::io::Result<()> {
    if let Err(_) = env::var("IUPLOADER_ADMIN_PASSWORD") {
        eprintln!("Error! ENV \"IUPLOADER_ADMIN_PASSWORD\" is not registered.");
        std::process::exit(1);
    }

    env_logger::init();
    HttpServer::new(||
            App::new()
                // /album
                .service(endpoints::get_all_albums)
                .service(endpoints::create_album)

                // /album/{album}
                .service(endpoints::update_album)
                .service(endpoints::remove_album)

                // / album/{album}/items
                .service(endpoints::get_items_in_album)

                // /album/{album}/items/image/{file}
                .service(endpoints::get_image_in_album)
                .service(endpoints::upload_image_to_album)
                .service(endpoints::remove_image_in_album)

                // /album/{album}/items/youtube/{id}
                .service(endpoints::upload_youtube_movie_to_album)
                .service(endpoints::remove_youtube_movie_in_album)

                .wrap(Logger::default())
        )
        .bind(("0.0.0.0", 50000))?
        .run()
        .await
}
