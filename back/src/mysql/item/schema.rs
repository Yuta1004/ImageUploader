diesel::table! {
    items {
        id -> Integer,
        album_id -> Text,
        #[sql_name="type"]
        _type -> Integer,
        name -> Text,
        path -> Text,
    }
}

diesel::table! {
    items_v {
        id -> Integer,
        album_id -> Text,
        #[sql_name="type"]
        _type -> Text,
        name -> Text,
        path -> Text,
        uploaded_at -> Text,
    }
}
