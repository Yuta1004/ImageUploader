pub mod schema;
pub mod model;

use diesel::QueryDsl;
use diesel::prelude::*;

use super::create_connection;

pub fn get_items(album: &str) -> Result<(Vec<model::Item>, Vec<model::Item>), Box<dyn std::error::Error>> {
    use schema::items_v::dsl::*;

    let mut conn = create_connection()?;
    let result = items_v
        .filter(album_id.eq(album))
        .load::<model::Item>(&mut conn)?;

    Ok(result.into_iter()
        .fold((vec![], vec![]), |(mut images, mut youtube_movies), item| {
            match item._type.as_str() {
                "image" => images.push(item),
                "youtube" => youtube_movies.push(item),
                ty => panic!("Found unregistered file! ({})", ty)
            }
            (images, youtube_movies)
        }))
}

pub fn save_item(album: &str, _type: model::ItemType, name: &str, path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let item = model::NewItem::new(album, _type, name, path);

    let mut conn = create_connection()?;
    diesel::insert_into(schema::items::dsl::items)
        .values(item)
        .execute(&mut conn)?;
    Ok(())
}

pub fn remove_item(album: &str, item_name: &str) -> Result<(), Box<dyn std::error::Error>> {
    use schema::items::dsl::*;

    let mut conn = create_connection()?;
    diesel::delete(schema::items::dsl::items)
        .filter(album_id.eq(album))
        .filter(name.eq(item_name))
        .execute(&mut conn)?;
    Ok(())
}
