import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Fab from "@mui/material/Fab";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

import { MsgContext, AlbumSettingsDialogContext } from "../App";
import Album from "../model/Album";
import AlbumSettingsDialog, { AlbumSettingsDialogValues } from "../components/AlbumSettingsDialog";

const AlbumListPage = () => {
    const navigate = useNavigate();

    const [albums, setAlbums] = useState<Album[]>([]);

    const [nowLoading, setLoadingStat] = useState(false);

    const [_, showMsg] = useContext(MsgContext);

    const [__, showAlbumSettingsDialog] = useContext(AlbumSettingsDialogContext);

    const loadAlbums = () => {
        setLoadingStat(true);
        axios
            .get("/back/album")
            .then(response => (async () => {
                setAlbums(response.data);
            })())
            .catch(() => {
                showMsg(["error", "アルバム情報の取得に失敗しました"])
            })
            .finally(() => {
                setLoadingStat(false);     
            });
    }

    const createAlbum = (values: AlbumSettingsDialogValues) => {
        const adminPassword = window.prompt("管理者パスワードを入力してください");

        const albumInfo = new URLSearchParams();
        albumInfo.append("name", values.name);
        albumInfo.append("passphrase", values.passphrase);
        albumInfo.append("writable", values.writable ? "true" : "false");
        albumInfo.append("removable", values.removable ? "true" : "false");

        const headers = {
            "IU-AdminPassword": adminPassword,
            "content-type": "application/x-www-form-urlencoded"
        };
        axios
            .post("/back/album", albumInfo, { headers })
            .then(_ => (async () => {
                loadAlbums();
            })())
            .catch((err) => {
                showMsg(["error", "アルバム作成に失敗しました : " + err]);
            })
    }

    const genAvatarURL = (key: string) => {
        return "https://source.boringavatars.com/beam/150/" + key + "?square&colors=264653,2a9d8f,e9c46a,f4a261,e76f51";
    }

    const createAlbumCard = (album: Album) => {
        return (
            <Card
                onClick={() => navigate("/album?id=" + album.id)} 
                sx={{ height: "fit-content" }}
            >
                <CardMedia
                    sx={{ height: 150 }}
                    image={ genAvatarURL(album.id) }
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        { album.name }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        最終更新 : { album.last_updated_at }
                    </Typography>
                    <Stack direction="row" spacing={1} style={{ margin: "15px 0 0 0" }}>
                        { album.writable || album.removable ? <Chip label="編集可能" color="success" variant="outlined" /> : <></> }
                        <Chip label={ "アイテム数: " + album.items_count } color="success" variant="outlined" /> 
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    useEffect(loadAlbums, []);

    return (
        <div style={{ minHeight: "100vh" }}>
            <Typography
                variant="h2"
                align="center"
                style={{
                    width: "50%",
                    margin: "0 auto",
                    padding: "50px 0 0 0"
                }}
            >
                Image Uploader
            </Typography>
            <div
                style={{
                    width: "75%",
                    minHeight: "55vh",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))",
                    gap: "40px",
                    padding: "75px 0",
                }}
            >
                { albums.map((album) => createAlbumCard(album)) }
            </div>
            <Typography
                variant="body1"
                style={{
                    width: "50%",
                    margin: "0 auto",
                    padding: "50px 0 0 0",
                    textAlign: "center",
                    position: "relative",
                    bottom: 10,
                    left: 0,
                    right: 0
                }}
            >
                © 2023 Yuta NAKAGAMI
            </Typography>
            <Fab
                color="primary"
                onClick={() => showAlbumSettingsDialog(true)}
                sx={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    margin: "5px"
                }}
            >
                <AddIcon />
            </Fab>
            <AlbumSettingsDialog
                initValues={null}
                submitText="作成"
                onSubmit={(values) => createAlbum(values)}
            />
            <CircularProgress
                size={80}
                style={{
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    margin: "auto",
                    display: nowLoading ? "inline" : "none",
                }}
            />
        </div>
    );
}

export default AlbumListPage;
