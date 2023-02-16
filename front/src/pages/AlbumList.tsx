import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

const AlbumListPage = () => {
    const navigate = useNavigate();

    const genAvatarURL = (key: string) => {
        return "https://source.boringavatars.com/beam/150/" + key + "?square&colors=264653,2a9d8f,e9c46a,f4a261,e76f51";
    }

    const createAlbumCard = () => {
        return (
            <Card
                onClick={() => navigate("/album?id=aaa")} 
            >
                <CardMedia
                    sx={{ height: 150 }}
                    image={ genAvatarURL("ABCDEFGH") }
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        アルバムタイトル
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        最終更新 : xxxx/xx/xx xx:xx
                    </Typography>
                    <Stack direction="row" spacing={1} style={{ margin: "15px 0 0 0" }}>
                        <Chip label="編集可能" color="success" variant="outlined" />
                        <Chip label="合言葉が必要です" color="info" variant="outlined" />
                    </Stack>
                </CardContent>
            </Card>
        );
    }

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
                { createAlbumCard() }
                { createAlbumCard() }
                { createAlbumCard() }
                { createAlbumCard() }
                { createAlbumCard() }
                { createAlbumCard() }
                { createAlbumCard() }
                { createAlbumCard() }
                { createAlbumCard() }
                { createAlbumCard() }
                { createAlbumCard() }
            </div>
        </div>
    );
}

export default AlbumListPage;
