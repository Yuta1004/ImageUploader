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
        const adminPassword = window.prompt("???????????????????????????????????????????????????");

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
                showMsg(["error", "?????????????????????????????????????????????"]);
            })
    }

    const removeImage = (filePath: string) => {
        if (window.confirm("?????????????????????????????????????????? ??????????????????????????????????????????")) {
            setLoadingStat(true);
            const headers = { withCredentials: true };
            axios
                .delete(filePath, { headers })
                .then(_ => (async () => {
                    showMsg(["success", "???????????????????????????????????????"]);
                    loadAlbum(albumId);
                })())
                .catch(() => {
                    showMsg(["success", "???????????????????????????????????????"]);
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
                    showMsg(["error", "???????????????????????????????????????????????????"]);
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
                    showMsg(["success", "???????????????????????????????????????"]);
                    loadAlbum(albumId);
                })
                .catch(() => {
                    showMsg(["error", "???????????????????????????????????????"]);
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
        if (window.confirm("?????????????????????????????????????????? ??????????????????????????????????????????")) {
            setLoadingStat(true);
            const headers = { withCredentials: true };
            axios
                .delete("/back/album/"+albumId+"/items/youtube/"+movieId, { headers })
                .then(_ => (async () => {
                    showMsg(["success", "????????????????????????????????????"]);
                    loadAlbum(albumId);
                })())
                .catch(() => {
                    showMsg(["success", "????????????????????????????????????"]);
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
                showMsg(["error", "??????????????????????????????????????????"]);
                return;
            }
            if (!url.startsWith("https://youtu.be/")) {
                showMsg(["error", "?????????????????????????????????????????????"]);
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
                    showMsg(["success", "?????????????????????????????????????????????"]);
                    loadAlbum(albumId);
                })
                .catch(() => {
                    showMsg(["error", "?????????????????????????????????????????????"]);
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
        const passphrase = window.prompt("????????????????????????????????????", "");
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
            {/* ?????????????????????????????? */}
            <div style={{ display: authStat ? "none" : "inline" }}>
                <Alert
                    severity="error"
                    sx={{
                        width: "50%",
                        margin: "0 auto"
                    }}
                >
                    <AlertTitle>???????????????</AlertTitle>
                    ????????????????????????????????????????????????????????????<br/>
                    <strong>?????????</strong>???????????????????????????
                </Alert>
            </div>

            {/* ?????? */}
            <div style={{ display: authStat ? "inline" : "none" }}>
                {/* ???????????????????????? */}
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
                    { album !== null && "???????????? : " + album.last_updated_at }
                </Typography>

                {/* ???????????????????????????????????? */}
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
                            label="?????????"
                            variant="outlined"
                            inputRef={ inputYMovieName }
                            sx={{ flexGrow: 1 }}
                        />
                        <TextField
                            size="small"
                            label="YouTube?????????"
                            variant="outlined"
                            inputRef={ inputYMovieURL }
                            sx={{ flexGrow: 1 }}
                        />
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={ saveYoutubeMovie }
                        >
                            ?????????????????????
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
                            ?????????????????????
                        </Button>
                    </Stack>
                </Stack>

                {/* ???????????? */}
                <div style={{ display: album?.youtube_movies.length! > 0 ? "inline" : "none" }}>
                    <Typography variant="h4">
                        ??????
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

                {/* ???????????? */}
                <div style={{ display: album?.images.length! > 0 ? "inline" : "none" }}>
                    <Typography variant="h4">
                        ??????
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

                {/* ???????????? */}
                <Dialog
                    onClose={() => setShowImgStat(false)}
                    open={ showImgStat }
                >
                    <img src={ showImgURL }/>
                </Dialog>

                {/* ?????????????????????????????? */}
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

            {/* ???????????????????????????????????? */}
            <AlbumSettingsDialog
                initValues={{ ...album!, passphrase: "" }}
                submitText="??????"
                onSubmit={(values) => updateAlbum(values)}
            />
        </Paper>
    );
}

export default AlbumDetailPage;
