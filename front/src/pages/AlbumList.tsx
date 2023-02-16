import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import { MsgContext } from "../App";
import Album from "../model/Album";

const AlbumListPage = () => {
    const navigate = useNavigate();

    const [albums, setAlbums] = useState<Album[]>([]);

    const [_, showMsg] = useContext(MsgContext);

    const genAvatarURL = (key: string) => {
        return "https://source.boringavatars.com/beam/150/" + key + "?square&colors=264653,2a9d8f,e9c46a,f4a261,e76f51";
    }

    const createAlbumCard = (album: Album) => {
        return (
            <Card
                onClick={() => navigate("/album?id=" + album.id)} 
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
                        最終更新 : { album.last_update }
                    </Typography>
                    <Stack direction="row" spacing={1} style={{ margin: "15px 0 0 0" }}>
                        { album.writable || album.removable ? <Chip label="編集可能" color="success" variant="outlined" /> : <></> }
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    useEffect(() => {
        axios
            .get("/back/album")
            .then(response => (async () => {
                setAlbums(response.data);
            })())
            .catch(() => {
                showMsg(["error", "アルバム情報の取得に失敗しました"])
            });
    }, []);

    return (
        <div>
            <Typography
                variant="h2"
                style={{
                    width: "50%",
                    margin: "0 auto",
                    padding: "50px 0 0 0",
                    textAlign: "center"
                }}
            >
                Image Uploader
            </Typography>
            <div
                style={{
                    width: "75%",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "40px",
                    padding: "75px",
                }}
            >
                { albums.map((album) => createAlbumCard(album)) }
            </div> 
        </div>
    );
}

export default AlbumListPage;
