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

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const [nowLoading, setLoadingStat] = useState(false);

    const [_, showMsg] = useContext(MsgContext);

    const [__, showAlbumSettingsDialog] = useContext(AlbumSettingsDialogContext);

    const loadImages = (albumId: string) => {
        if (albumId !== "") {
            setLoadingStat(true);
            const headers = { withCredentials: true };
            axios
                .get("/back/album/"+albumId, { headers })
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

    const removeImage = (fileURL: string) => {
        if (window.confirm("本当に削除しても良いですか？ （この操作は取り消せません）")) {
            setLoadingStat(true);
            const headers = { withCredentials: true };
            axios
                .delete(fileURL, { headers })
                .then(_ => (async () => {
                    showMsg(["success", "ファイル削除に成功しました"]);
                    loadImages(albumId);
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
                .put("/back/album/"+albumId, ffiles, { headers })
                .then(() => {
                    showMsg(["success", "ファイル送信に成功しました"]);
                    loadImages(albumId);
                })
                .catch(() => {
                    showMsg(["error", "ファイル送信に失敗しました"]);
                })
                .finally(() => {
                    setLoadingStat(false);
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
        // axios
        //     .post("/back/album", albumInfo, { headers })
        //     .then(_ => (async () => {
        //         window.location.reload();
        //     })())
        //     .catch((err) => {
        //         showMsg(["error", "アルバム情報更新に失敗しました : " + err]);
        //     })
    }

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

    useEffect(() => {
        const passphrase = window.prompt("合言葉を入力してください", "");
        setCookies("IU-Passphrase", passphrase);

        const query = new URLSearchParams(location.search);   
        const _albumId = query.get("id") === null ? "" : query.get("id")!;
        setAlbumId(_albumId);
        loadImages(_albumId);
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
                <Stack
                    spacing={2}
                    direction="row"
                    sx={{
                        width: "50%",
                        margin: "20px auto",
                        justifyContent: "center",
                        display: album?.writable ? "flex" : "none"
                    }} 
                >
                    <MuiFileInput
                        multiple
                        value={selectedFiles}
                        onChange={(files) => setSelectedFiles(files)}
                    />
                    <Button
                        variant="outlined"
                        onClick={saveImages}
                    >
                        写真を追加する
                    </Button>
                </Stack>
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
                    { album !== null && album.files.map((fileURL) => createImageCard("/back/album/" + fileURL)) }
                </div>
                <Dialog
                    onClose={() => setShowImgStat(false)}
                    open={ showImgStat }
                >
                    <img src={ showImgURL }/>
                </Dialog>
                <CircularProgress
                    size={80}
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        margin: "auto",
                        display: nowLoading ? "inline" : "none"
                    }}
                />
            </div> 
            <AlbumSettingsDialog
                initValues={{ ...album!, passphrase: "" }}
                submitText="更新"
                onSubmit={(values) => updateAlbum(values)}
            />
        </Paper>
    );
}

export default AlbumDetailPage;
