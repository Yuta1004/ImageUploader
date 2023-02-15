DROP DATABASE IF EXISTS iuploader;
CREATE DATABASE iuploader;

USE iuploader;

/* 1. アルバム情報 */
DROP TABLE IF EXISTS albums;
CREATE TABLE albums (
    id          CHAR(8)                 PRIMARY KEY,
    `name`      VARCHAR(64) NOT NULL,
    writable    BOOLEAN     NOT NULL    DEFAULT false,
    removable   BOOLEAN     NOT NULL    DEFAULT false,
    last_update DATETIME                DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
