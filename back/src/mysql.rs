use rand::distributions::{Alphanumeric, DistString};
use diesel::RunQueryDsl;
use diesel::mysql::MysqlConnection;
use diesel::prelude::{Connection, ConnectionError};

const ENDPOINT: &str = "mysql://root:mysql@mysql:3306/iuploader";

mod schema {
    diesel::table! {
        albums (id) {
            id -> Text,
            name -> Text,
            writable -> Bool,
            removable -> Bool,
            last_update -> Text,
        }
    }
}

mod model {
    use diesel::prelude::{Queryable, Insertable};

    #[derive(Debug, Queryable)]
    pub struct Album {
        pub id: String,
        pub name: String,
        pub writable: bool,
        pub removable: bool,
        pub last_update: String
    }

    #[derive(Insertable)]
    #[diesel(table_name = crate::mysql::schema::albums)]
    pub struct NewAlbum<'a> {
        pub id: &'a String,
        pub name: &'a String,
        pub writable: bool,
        pub removable: bool
    }

    impl<'a> NewAlbum<'a> {
        pub fn new(id: &'a String, name: &'a String, writable: bool, removable: bool) -> NewAlbum<'a> {
            NewAlbum { id, name, writable, removable }
        }
    }
}

fn create_connection() -> Result<MysqlConnection, ConnectionError> {
    MysqlConnection::establish(ENDPOINT)
}

pub fn create_album(name: &String, writable: bool, removable: bool) -> Result<String, Box<dyn std::error::Error>> {
    let mut conn = create_connection()?;

    let album_id = Alphanumeric.sample_string(&mut rand::thread_rng(), 8);
    let new_album = model::NewAlbum::new(&album_id, &name, writable, removable);
    diesel::insert_into(schema::albums::dsl::albums)
        .values(&new_album)
        .execute(&mut conn)?;

    Ok(album_id)
}
