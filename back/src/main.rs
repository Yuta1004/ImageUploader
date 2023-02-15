mod s3;
mod mysql;
mod endpoints;

use actix_web::middleware::Logger;
use actix_web::{App, HttpServer};

#[tokio::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    HttpServer::new(||
            App::new()
                // /album
                .service(endpoints::create_album)

                // /album/{album}
                .service(endpoints::get_image_list_in_album)
                .service(endpoints::upload_image_to_album)
                .service(endpoints::remove_album)

                // /album/{album}/{file}
                .service(endpoints::get_image_in_album)

                .wrap(Logger::default())
        )
        .bind(("0.0.0.0", 50000))?
        .run()
        .await
}
