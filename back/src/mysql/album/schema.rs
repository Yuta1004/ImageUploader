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
