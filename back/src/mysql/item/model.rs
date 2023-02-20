use diesel::AsChangeset;
use diesel::prelude::{Queryable, Insertable};

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