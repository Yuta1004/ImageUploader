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

#[derive(Debug, Clone, Queryable)]
pub struct Item {
    pub id: i32,
    pub album_id: String,
    pub _type: String,
    pub name: String,
    pub path: String,
    pub uploaded_at: String
}

pub enum ItemType {
    Picture = 0,
    YouTube = 1,
}

impl Into<i32> for ItemType {
    fn into(self) -> i32 {
        match self {
            ItemType::Picture => 0,
            ItemType::YouTube => 1,
        }
    }
}

#[derive(Insertable, AsChangeset)]
#[diesel(table_name = super::schema::items)]
pub struct NewItem<'a> {
    pub album_id: &'a String,
    pub _type: i32,
    pub name: &'a String,
    pub path: &'a String
}

impl <'a> NewItem<'a> {
    pub fn new(album_id: &'a String, _type: ItemType, name: &'a String, path: &'a String) -> NewItem<'a> {
        NewItem {
            album_id,
            _type: _type.into(),
            name,
            path
        }
    }
}
