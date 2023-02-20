diesel::table! {
    albums {
        id -> Text,
        name -> Text,
        writable -> Bool,
        removable -> Bool,
        passphrase -> Text,
    }
}

diesel::table! {
    albums_v {
        id -> Text,
        name -> Text,
        writable -> Bool,
        removable -> Bool,
        passphrase -> Text,
        last_updated_at -> Text,
        items_count -> Integer,
    }
}

diesel::table! {
    items {
        id -> Integer,
        album_id -> Text,
        #[sql_name="name"]
        _type -> Integer,
        name -> Text,
        path -> Text,
    }
}

diesel::table! {
    items_v {
        id -> Integer,
        album_id -> Text,
        #[sql_name="name"]
        _type -> Text,
        name -> Text,
        path -> Text,
    }
}
