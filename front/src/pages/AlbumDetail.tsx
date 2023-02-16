import { useState, useEffect } from "react";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { useLocation } from "react-router-dom";

const AlbumDetailPage = () => {
    const location = useLocation();
    const [albumId, setAlbumId] = useState("");

    const [showImgStat, setShowImgStat] = useState(false);
    const [showImgURL, setShowImgURL] = useState("");

    useEffect(() => {
        const query = new URLSearchParams(location.search);   
        const _albumId = query.get("id");
        setAlbumId(_albumId === null ? "" : _albumId);
    }, []);

    const createImageCard = () => {
        return (
            <Card
                onClick={() => {
                    setShowImgStat(true);
                    setShowImgURL("https://www.tsukuba-chuko.com/wp/wp-content/uploads/2020/12/4244264_s.jpg");
                }} 
            >
                <CardMedia
                    sx={{ height: 150 }}
                    image="https://www.tsukuba-chuko.com/wp/wp-content/uploads/2020/12/4244264_s.jpg"
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
                            aaa.png
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
                { albumId }
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
                { createImageCard() }
                { createImageCard() }
                { createImageCard() }
                { createImageCard() }
                { createImageCard() }
                { createImageCard() }
                { createImageCard() }
                { createImageCard() }
                { createImageCard() }
                { createImageCard() }
                { createImageCard() }
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
