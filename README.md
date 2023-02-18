# Image Uploader

## 実行

`Docker` `docker-compose` が必要です

### 1. 設定ファイル作成

```
$ make setup
```

生成された `run.conf` を環境に合わせて編集してください

- `IUPLOADER_PORT` : 待受ポート番号
- `IUPLOADER_ADMIN_PASSWORD` : 管理者パスワード

### 2. 起動

```
$ make run
```
