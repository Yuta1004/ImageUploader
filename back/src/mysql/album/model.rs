use diesel::AsChangeset;
use diesel::prelude::{Queryable, Insertable};

#[derive(Debug, Clone, Queryable)]
pub struct Album {
    pub id: String,
    pub name: String,
    pub writable: bool,
    pub removable: bool,
    pub passphrase: String,
    pub last_updated_at: String,
    pub items_count: i32
}

#[derive(Insertable, AsChangeset)]
#[diesel(table_name = super::schema::albums)]
pub struct NewAlbum<'a> {
    pub id: &'a str,
    pub name: &'a str,
    pub writable: bool,
    pub removable: bool,
    pub passphrase: &'a str
}

impl<'a> NewAlbum<'a> {
    pub fn new(id: &'a str, name: &'a str, writable: bool, removable: bool, passphrase: &'a str) -> NewAlbum<'a> {
        NewAlbum { id, name, writable, removable, passphrase }
    }
}
