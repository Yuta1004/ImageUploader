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
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { MuiFileInput } from "mui-file-input";

import { MsgContext, AlbumSettingsDialogContext } from "../App";
import Album from "../model/Album";
import AlbumSettingsDialog, { AlbumSettingsDialogValues } from "../components/AlbumSettingsDialog";

const AlbumDetailPage = () => {
    const [cookies, setCookies] = useCookies(["IU-Passphrase"]);

    const [authStat, setAuthStat] = useState(true);

    const location = useLocation();
    const [albumId, setAlbumId] = useState("");
    const [album, setAlbum] = useState<Album | null>(null);

    const [showImgStat, setShowImgStat] = useState(false);
    const [showImgURL, setShowImgURL] = useState("");

    const inputYMovieName = useRef<HTMLInputElement | null>(null);
    const inputYMovieURL = useRef<HTMLInputElement | null>(null);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const [nowLoading, setLoadingStat] = useState(false);

    const [_, showMsg] = useContext(MsgContext);

    const [__, showAlbumSettingsDialog] = useContext(AlbumSettingsDialogContext);

    const loadAlbum = (albumId: string) => {
        if (albumId !== "") {
            setLoadingStat(true);
            const headers = { withCredentials: true };
            axios
                .get("/back/album/"+albumId+"/items", { headers })
                .then(response => (async () => {
                    setAuthStat(true);
                    setAlbum(response.data);
                })())
                .catch(() => {
                    setAuthStat(false);
                })
                .finally(() => {
                    setLoadingStat(false)
                });
        }
    };

    const updateAlbum = (values: AlbumSettingsDialogValues) => {
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
            .post("/back/album/"+album?.id, albumInfo, { headers })
            .then(_ => (async () => {
                loadAlbum(albumId);
            })())
            .catch((_) => {
                showMsg(["error", "アルバム情報更新に失敗しました"]);
            })
    }

    const removeImage = (filePath: string) => {
        if (window.confirm("本当に削除しても良いですか？ （この操作は取り消せません）")) {
            setLoadingStat(true);
            const headers = { withCredentials: true };
            axios
                .delete(filePath, { headers })
                .then(_ => (async () => {
                    showMsg(["success", "ファイル削除に成功しました"]);
                    loadAlbum(albumId);
                })())
                .catch(() => {
                    showMsg(["success", "ファイル削除に失敗しました"]);
                    setAuthStat(false);
                })
                .finally(() => {
                    setLoadingStat(false);
                });
        }
    };

    const saveImages = () => {
        if (albumId !== "") {
            var ffiles = new FormData();
            for(var idx = 0; idx < selectedFiles.length; ++ idx) {
                const file = selectedFiles[idx];
                if (!file.type.startsWith("image")) {
                    showMsg(["error", "画像でないファイルが含まれています"]);
                    return;
                }
                ffiles.append(file.name, file);
            } 

            setLoadingStat(true);
            const headers = {
                withCredentials: true,
                "content-type": "multipart/form-data"
            };
            axios
                .put("/back/album/"+albumId+"/items/image", ffiles, { headers })
                .then(() => {
                    showMsg(["success", "ファイル送信に成功しました"]);
                    loadAlbum(albumId);
                })
                .catch(() => {
                    showMsg(["error", "ファイル送信に失敗しました"]);
                })
                .finally(() => {
                    setLoadingStat(false);
                });
        }
    };

    const createImageCard = (fileName: string) => {
        const filePath = "/back/album/"+album?.id+"/items/image/"+fileName;
        return (
            <Card>
                <CardMedia
                    sx={{ height: 150 }}
                    image={ filePath }
                    onClick={() => {
                        setShowImgStat(true);
                        setShowImgURL(filePath);
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
                            { fileName }
                        </Typography>
                        <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => { removeImage(filePath) }}
                            sx={{ display: album?.removable ? "inline" : "none" }}
                        >
                            <DeleteOutlineIcon/>
                        </IconButton>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    const removeYMovie = (movieId: string) => {
        if (window.confirm("本当に削除しても良いですか？ （この操作は取り消せません）")) {
            setLoadingStat(true);
            const headers = { withCredentials: true };
            axios
                .delete("/back/album/"+albumId+"/items/youtube/"+movieId, { headers })
                .then(_ => (async () => {
                    showMsg(["success", "動画の削除に成功しました"]);
                    loadAlbum(albumId);
                })())
                .catch(() => {
                    showMsg(["success", "動画の削除に失敗しました"]);
                    setAuthStat(false);
                })
                .finally(() => {
                    setLoadingStat(false);
                });
        }
    };

    const saveYoutubeMovie = () => {
        if (albumId !== "") {
            const name = inputYMovieName.current?.value!;
            const url = inputYMovieURL.current?.value!;
            if (name === "" || url === "") {
                showMsg(["error", "全ての項目に入力してください"]);
                return;
            }
            if (!url.startsWith("https://youtu.be/")) {
                showMsg(["error", "リンクの形式が正しくありません"]);
                return;
            }

            var movie_info = new URLSearchParams();
            movie_info.append("name", name);
            movie_info.append("movie_id", url.split("/").slice(-1)[0]);

            setLoadingStat(true);
            const headers = {
                withCredentials: true,
                "content-type": "application/x-www-form-urlencoded"
            };
            axios
                .put("/back/album/"+albumId+"/items/youtube", movie_info, { headers })
                .then(() => {
                    showMsg(["success", "動画リンクの送信に成功しました"]);
                    loadAlbum(albumId);
                })
                .catch(() => {
                    showMsg(["error", "動画リンクの送信に失敗しました"]);
                })
                .finally(() => {
                    setLoadingStat(false);
                });
        }
    };

    const createYMovieCard = (ymovie: [string, string]) => {
        const [name, movieId] = ymovie;
        return (
            <Card>
                <iframe
                    width="100%"
                    src={ "https://www.youtube.com/embed/"+movieId }
                    title="YouTube video player" 
                    allowFullScreen
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
                            { name }
                        </Typography>
                        <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => { removeYMovie(movieId) }}
                            sx={{ display: album?.removable ? "inline" : "none" }}
                        >
                            <DeleteOutlineIcon/>
                        </IconButton>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    useEffect(() => {
        const passphrase = window.prompt("合言葉を入力してください", "");
        setCookies("IU-Passphrase", passphrase);

        const query = new URLSearchParams(location.search);   
        const _albumId = query.get("id") === null ? "" : query.get("id")!;
        setAlbumId(_albumId);
        loadAlbum(_albumId);
    }, []);

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
            {/* 認証エラーメッセージ */}
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

            {/* 本体 */}
            <div style={{ display: authStat ? "inline" : "none" }}>
                {/* アルバムタイトル */}
                <Typography
                    variant="h2"
                    style={{
                        width: "50%",
                        margin: "0 auto",
                        padding: "50px 0 0 0",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    { album !== null && album.name }
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => showAlbumSettingsDialog(true)}
                    >
                        <EditIcon />
                    </Fab>
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
                    { album !== null && "最終更新 : " + album.last_updated_at }
                </Typography>

                {/* リンク・画像投稿フォーム */}
                <Stack
                    spacing={1}
                    direction="column"
                    sx={{
                        display: album?.writable ? "flex" : "none",
                        alignItems: "center",
                        margin: "10px",
                    }}
                >
                    <Stack
                        spacing={2}
                        direction="row"
                        sx={{
                            width: "50%",
                            margin: "0 auto",
                            justifyContent: "center"
                        }} 
                    >
                        <TextField
                            size="small"
                            label="動画名"
                            variant="outlined"
                            inputRef={ inputYMovieName }
                            sx={{ flexGrow: 1 }}
                        />
                        <TextField
                            size="small"
                            label="YouTubeリンク"
                            variant="outlined"
                            inputRef={ inputYMovieURL }
                            sx={{ flexGrow: 1 }}
                        />
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={ saveYoutubeMovie }
                        >
                            動画を追加する
                        </Button>
                    </Stack>
                    <Stack
                        spacing={2}
                        direction="row"
                        sx={{
                            width: "50%",
                            margin: "0 auto",
                            justifyContent: "center",
                        }} 
                    >
                        <MuiFileInput
                            multiple
                            size="small"
                            value={ selectedFiles }
                            onChange={(files) => setSelectedFiles(files)}
                            sx={{ flexGrow: 1}}
                        />
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={ saveImages }
                        >
                            写真を追加する
                        </Button>
                    </Stack>
                </Stack>

                {/* 動画一覧 */}
                <div style={{ display: album?.youtube_movies.length! > 0 ? "inline" : "none" }}>
                    <Typography variant="h4">
                        動画
                    </Typography>
                    <div
                        style={{
                            width: "100%",
                            margin: "0 auto",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "20px",
                            padding: "50px 0 50px 0",
                        }}
                    >
                        { album !== null && album.youtube_movies.map((ymovie) => createYMovieCard(ymovie)) }
                    </div>
                </div>

                {/* 画像一覧 */}
                <div style={{ display: album?.images.length! > 0 ? "inline" : "none" }}>
                    <Typography variant="h4">
                        画像
                    </Typography>
                    <div
                        style={{
                            width: "100%",
                            margin: "0 auto",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "20px",
                            padding: "50px 0 50px 0",
                        }}
                    >
                        { album !== null && album.images.map((fileName) => createImageCard(fileName)) }
                    </div>
                </div>

                {/* 詳細表示 */}
                <Dialog
                    onClose={() => setShowImgStat(false)}
                    open={ showImgStat }
                >
                    <img src={ showImgURL }/>
                </Dialog>

                {/* ローディングアイコン */}
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

            {/* アルバム情報設定フォーム */}
            <AlbumSettingsDialog
                initValues={{ ...album!, passphrase: "" }}
                submitText="更新"
                onSubmit={(values) => updateAlbum(values)}
            />
        </Paper>
    );
}

export default AlbumDetailPage;
