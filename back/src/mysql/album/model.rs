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
