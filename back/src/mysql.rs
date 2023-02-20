pub mod album;
pub mod item;

use diesel::mysql::MysqlConnection;
use diesel::prelude::*;

const ENDPOINT: &str = "mysql://root:mysql@mysql:3306/iuploader";

fn create_connection() -> Result<MysqlConnection, ConnectionError> {
    MysqlConnection::establish(ENDPOINT)
}
