import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

const AlbumListPage = () => {
    const createAlbumCard = () => {
        return (
            <Card>
                <CardMedia
                    sx={{ height: 200 }}
                    image="https://www.tsukuba-chuko.com/wp/wp-content/uploads/2020/12/4244264_s.jpg"
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
    };

    return (
        <div
            style={{
                position: "relative",
                left: "50%",
                transform: "translate(-50%, 0%)",
                WebkitTransform: "translate(-50%, 0%)",
                msTransform: "translate(-50%, 0%)",
                width: "75%",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "40px",
                padding: "100px",
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
    );
}

export default AlbumListPage;
