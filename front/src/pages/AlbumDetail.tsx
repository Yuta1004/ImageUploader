import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import Album from "../model/Album";

const AlbumDetailPage = () => {
    const location = useLocation();
    const [albumId, setAlbumId] = useState("");
    const [album, setAlbum] = useState<Album | null>(null);

    const [showImgStat, setShowImgStat] = useState(false);
    const [showImgURL, setShowImgURL] = useState("");

    useEffect(() => {
        const query = new URLSearchParams(location.search);   
        const _albumId = query.get("id");
        setAlbumId(_albumId === null ? "" : _albumId);
    }, []);

    useEffect(() => {
        if (albumId !== "") {
            axios
                .get("/back/album/"+albumId)
                .then(response => (async () => {
                    setAlbum(response.data);
                })())
                .catch(() => {
                    // showMsg(["error", "アルバム情報の取得に失敗しました"])
                    console.log("error!")
                });
        }
    }, [albumId]);

    const createImageCard = (fileURL: string) => {
        return (
            <Card
                onClick={() => {
                    setShowImgStat(true);
                    setShowImgURL("/back/album/"+fileURL);
                }} 
            >
                <CardMedia
                    sx={{ height: 150 }}
                    image={ "/back/album/"+fileURL }
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
                        <Typography variant="body2" color="text.secondary">
                            { fileURL.split("/").slice(-1) }
                        </Typography>
                        <IconButton color="secondary" size="small">
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
                margin: "0 auto",
                padding: "50px",
                background: "rgba(255, 255, 255, 0.8)"
            }}
        >
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
                最終更新 : xxxx/xx/xx
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
                { album !== null && album.files.map((fileURL) => createImageCard(fileURL)) }
            </div>
            <Dialog
                onClose={() => setShowImgStat(false)}
                open={ showImgStat }
            >
                <img src={ showImgURL }/>
            </Dialog>
        </Paper>
    );
}

export default AlbumDetailPage;
