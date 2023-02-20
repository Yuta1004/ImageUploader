pub mod schema;
pub mod model;

use rand::distributions::{Alphanumeric, DistString};
use diesel::RunQueryDsl;
use diesel::prelude::*;

use super::create_connection;

pub fn get_all_albums() -> Result<Vec<model::Album>, Box<dyn std::error::Error>> {
    use schema::albums_v::dsl::*;

    let mut conn = create_connection()?;
    let result = albums_v.load::<model::Album>(&mut conn)?;
    Ok(result)
}

pub fn get_album(album_id: &String) -> Result<Option<model::Album>, Box<dyn std::error::Error>> {
    use schema::albums_v::dsl::*;

    let mut conn = create_connection()?;
    let result = albums_v
        .filter(id.eq(album_id))
        .load::<model::Album>(&mut conn)?;

    if result.len() > 0 {
        Ok(Some(result[0].clone()))
    } else {
        Ok(None)
    }
}

pub fn create_album(name: &String, writable: bool, removable: bool, passphrase: &String) -> Result<String, Box<dyn std::error::Error>> {
    let album_id = Alphanumeric.sample_string(&mut rand::thread_rng(), 8);
    let new_album = model::NewAlbum::new(&album_id, &name, writable, removable, passphrase);

    let mut conn = create_connection()?;
    diesel::insert_into(schema::albums::dsl::albums)
        .values(&new_album)
        .execute(&mut conn)?;
    Ok(album_id)
}

pub fn update_album(album_id: &String, name: &String, writable: bool, removable: bool, passphrase: &String) -> Result<String, Box<dyn std::error::Error>> {
    use schema::albums::dsl::id;

    let album = model::NewAlbum::new(album_id, name, writable, removable, passphrase);

    let mut conn = create_connection()?;
    diesel::update(schema::albums::dsl::albums)
        .filter(id.eq(album_id))
        .set(&album)
        .execute(&mut conn)?;
    Ok(album_id.to_owned())
}

pub fn remove_album(album_id: &String) -> Result<(), Box<dyn std::error::Error>> {
    use schema::albums::dsl::*;

    let mut conn = create_connection()?;
    diesel::delete(albums)
        .filter(id.eq(album_id))
        .execute(&mut conn)?;
    Ok(())
}
