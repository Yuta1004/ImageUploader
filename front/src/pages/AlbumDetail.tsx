import axios from "axios";
import { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { MsgContext } from "../App";
import Album from "../model/Album";

const AlbumDetailPage = () => {
    const [cookies, setCookies] = useCookies(["IU-Passphrase"]);

    const [authStat, setAuthStat] = useState(true);

    const location = useLocation();
    const [albumId, setAlbumId] = useState("");
    const [album, setAlbum] = useState<Album | null>(null);

    const [showImgStat, setShowImgStat] = useState(false);
    const [showImgURL, setShowImgURL] = useState("");

    const [_, showMsg] = useContext(MsgContext);

    const loadImages = (albumId: string) => {
        if (albumId !== "") {
            axios
                .get("/back/album/"+albumId, { withCredentials: true })
                .then(response => (async () => {
                    setAuthStat(true);
                    setAlbum(response.data);
                })())
                .catch(() => {
                    setAuthStat(false);
                });
        }
    };

    const removeImage = (fileURL: string) => {
        if (window.confirm("本当に削除しても良いですか？ （この操作は取り消せません）")) {
            axios
                .delete(fileURL, { withCredentials: true })
                .then(_ => (async () => {
                    loadImages(albumId);
                })())
                .catch(() => {
                    setAuthStat(false);
                });
        }
    };

    useEffect(() => {
        const passphrase = window.prompt("合言葉を入力してください", "");
        setCookies("IU-Passphrase", passphrase);

        const query = new URLSearchParams(location.search);   
        const _albumId = query.get("id") === null ? "" : query.get("id")!;
        setAlbumId(_albumId);
        loadImages(_albumId);
    }, []);

    const createImageCard = (fileURL: string) => {
        return (
            <Card>
                <CardMedia
                    sx={{ height: 150 }}
                    image={ fileURL }
                    onClick={() => {
                        setShowImgStat(true);
                        setShowImgURL(fileURL);
                    }}
                />
                <CardContent style={{ padding: "10px" }}>
                    <Stack
                        direction="row"
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            { fileURL.split("/").slice(-1) }
                        </Typography>
                        <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => { removeImage(fileURL) }}
                            sx={{ display: album?.removable ? "inline" : "none" }}
                        >
                            <DeleteOutlineIcon/>
                        </IconButton>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    return (
        <Paper
            elevation={ 12 }
            sx={{
                width: "75%",
                minHeight: "100vh",
                height: "100%",
                margin: "0 auto",
                padding: "50px",
                background: "rgba(255, 255, 255, 0.8)"
            }}
        >
            <div style={{ display: authStat ? "none" : "inline" }}>
                <Alert
                    severity="error"
                    sx={{
                        width: "50%",
                        margin: "0 auto"
                    }}
                >
                    <AlertTitle>認証エラー</AlertTitle>
                    このアルバムを閲覧することができません！<br/>
                    <strong>合言葉</strong>を確認してください
                </Alert>
            </div>
            <div style={{ display: authStat ? "inline" : "none" }}>
                <Typography
                    variant="h2"
                    style={{
                        width: "50%",
                        margin: "0 auto",
                        padding: "50px 0 0 0",
                        textAlign: "center"
                    }}
                >
                    { album !== null && album.name }
                </Typography>
                <Typography
                    variant="h6"
                    style={{
                        width: "50%",
                        margin: "0 auto",
                        padding: "10px 0 0 0",
                        textAlign: "center"
                    }}
                >
                    { album !== null && "最終更新 : " + album.last_update }
                </Typography>
                <div
                    style={{
                        width: "100%",
                        margin: "0 auto",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "20px",
                        padding: "75px 0 75px 0",
                    }}
                >
                    { album !== null && album.files.map((fileURL) => createImageCard("/back/album/" + fileURL)) }
                </div>
                <Dialog
                    onClose={() => setShowImgStat(false)}
                    open={ showImgStat }
                >
                    <img src={ showImgURL }/>
                </Dialog>
            </div>
        </Paper>
    );
}

export default AlbumDetailPage;
