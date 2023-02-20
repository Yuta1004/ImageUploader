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
    passphrase  VARCHAR(32) NOT NULL,
    created_at  DATETIME    NOT NULL    DEFAULT CURRENT_TIMESTAMP
);

/* 2. アイテムの種類 */
DROP TABLE IF EXISTS item_type;
CREATE TABLE item_type (
    `type`      INT                     PRIMARY KEY,
    `name`      VARCHAR(32)  NOT NULL
);
INSERT INTO item_type VALUES (0, "picture"), (1, "youtube");

/* 3. アイテム情報 */
DROP TABLE IF EXISTS items;
CREATE TABLE items (
    id          INT                     PRIMARY KEY AUTO_INCREMENT,
    album_id    CHAR(8)      NOT NULL,
    `type`      INT          NOT NULL,
    `name`      VARCHAR(64)  NOT NULL,
    `path`      VARCHAR(256) NOT NULL,
    uploaded_at DATETIME                DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY k_album_id  (album_id)  REFERENCES albums   (id),
    FOREIGN KEY k_type      (type)      REFERENCES item_type(type)
);

/* 4. albumsテーブルのビュー */
DROP VIEW IF EXISTS albums_v;
CREATE VIEW albums_v AS
    SELECT albums.id AS id, albums.name AS name, albums.writable AS writable,
           albums.removable AS removable, albums.passphrase AS passphrase, 
           ifnull(items.uploaded_at, albums.created_at) AS last_updated_at,
           ifnull(items.count, 0) AS items_count
    FROM albums
    LEFT JOIN (
        SELECT album_id, MAX(uploaded_at) AS uploaded_at, COUNT(*) AS count
        FROM items
        GROUP BY album_id
    ) AS items ON albums.id = items.album_id;

/* 5. itemsテーブルのビュー */
DROP VIEW IF EXISTS items_v;
CREATE VIEW items_v AS
    SELECT items.id AS id, item_type.name AS type,
           items.name AS name, items.path as path, items.uploaded_at AS uploaded_at
    FROM items
    LEFT JOIN item_type ON items.type = item_type.type;
