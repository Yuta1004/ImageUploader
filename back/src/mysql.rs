pub mod album;
pub mod item;

use diesel::mysql::MysqlConnection;
use diesel::prelude::*;
use diesel::sql_query;

const ENDPOINT: &str = "mysql://root:mysql@mysql:3306/iuploader";

fn create_connection() -> Result<MysqlConnection, ConnectionError> {
    match MysqlConnection::establish(ENDPOINT) {
        Ok(mut conn) => {
            sql_query("SET time_zone = '+9:00';").execute(&mut conn).unwrap();
            Ok(conn)
        },
        err => err
    }
}
