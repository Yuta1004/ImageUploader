use rand::distributions::{Alphanumeric, DistString};
use diesel::RunQueryDsl;
use diesel::mysql::MysqlConnection;
use diesel::prelude::*;

const ENDPOINT: &str = "mysql://root:mysql@mysql:3306/iuploader";

pub mod schema {
    diesel::table! {
        albums {
            id -> Text,
            name -> Text,
            writable -> Bool,
            removable -> Bool,
            passphrase -> Text,
            last_update -> Text,
        }
    }
}

pub mod model {
    use diesel::prelude::{Queryable, Insertable};

    #[derive(Debug, Clone, Queryable)]
    pub struct Album {
        pub id: String,
        pub name: String,
        pub writable: bool,
        pub removable: bool,
        pub passphrase: String,
        pub last_update: String
    }

    #[derive(Insertable)]
    #[diesel(table_name = crate::mysql::schema::albums)]
    pub struct NewAlbum<'a> {
        pub id: &'a String,
        pub name: &'a String,
        pub writable: bool,
        pub removable: bool,
        pub passphrase: &'a String
    }

    impl<'a> NewAlbum<'a> {
        pub fn new(id: &'a String, name: &'a String, writable: bool, removable: bool, passphrase: &'a String) -> NewAlbum<'a> {
            NewAlbum { id, name, writable, removable, passphrase }
        }
    }
}

fn create_connection() -> Result<MysqlConnection, ConnectionError> {
    MysqlConnection::establish(ENDPOINT)
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

pub fn check_album(album_id: &String) -> Result<Option<model::Album>, Box<dyn std::error::Error>> {
    use schema::albums::dsl::*;

    let mut conn = create_connection()?;
    let result = albums
        .filter(id.eq(album_id))
        .load::<model::Album>(&mut conn)?;

    if result.len() > 0 {
        Ok(Some(result[0].clone()))
    } else {
        Ok(None)
    }
}

pub fn remove_album(album_id: &String) -> Result<(), Box<dyn std::error::Error>> {
    use schema::albums::dsl::*;

    let mut conn = create_connection()?;
    diesel::delete(albums)
        .filter(id.eq(album_id))
        .execute(&mut conn)?;
    Ok(())
}
