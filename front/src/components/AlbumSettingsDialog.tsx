import { useContext, useEffect, useRef } from "react";

import Backdrop from "@mui/material/Backdrop";
import CloseIcon from "@mui/icons-material/Close";
import IconButon from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import { MsgContext, AlbumSettingsDialogContext } from "../App";

export interface AlbumSettingsDialogValues {
    name: string,
    passphrase: string,
    writable: boolean,
    removable: boolean 
}

interface AlbumSettingsDialogProps {
    initValues: AlbumSettingsDialogValues | null
    submitText: string,
    onSubmit: (values: AlbumSettingsDialogValues) => void
}

const AlbumSettingsDialog = (props: AlbumSettingsDialogProps) => {
    const [_, showMsg] = useContext(MsgContext);

    const [stat, showDialog] = useContext(AlbumSettingsDialogContext);

    const titleInput = useRef<TextFieldProps>(null);
    const passphraseInput = useRef<TextFieldProps>(null);
    const writableSwitch = useRef<HTMLInputElement>(null);
    const removableSwitch = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const useDefault = props.initValues === null;
        if (titleInput.current !== null) {
            titleInput.current.value = useDefault ? "アルバム１" : props.initValues?.name;
        }
        if (passphraseInput.current !== null) {
            passphraseInput.current.value = useDefault ? "apple" : props.initValues?.passphrase;
        }
    }, [props, titleInput, passphraseInput]);

    return (
        <Backdrop
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={ stat }
        >
            <Paper
                elevation={5}
                sx={{
                    position: "relative",
                    width: "40%",
                    padding: "40px"
                }}
            >
                <IconButon
                    onClick={() => showDialog(false)}
                    sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px"
                    }}
                >
                    <CloseIcon/>
                </IconButon>
                <h2 style={{ margin: "10px 5px 10px 0px" }}>
                    { "アルバム" + props.submitText }
                </h2>
                <Stack
                    direction="column"
                    spacing={2}
                >
                    <TextField
                        inputRef={ titleInput }
                        label="アルバム名"
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: "100%"}}
                    />
                    <TextField
                        inputRef={ passphraseInput }
                        label="合言葉"
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: "100%"}}
                    />
                    <FormGroup>
                        <FormControlLabel
                            control={<Switch inputRef={ writableSwitch }/>}
                            label="投稿機能を有効にする"
                        />
                        <FormControlLabel
                            control={<Switch inputRef={ removableSwitch }/>}
                            label="削除機能を有効にする"
                        />
                    </FormGroup>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            const tInput = titleInput.current?.value+"";
                            const pInput = passphraseInput.current?.value+"";
                            if (tInput === "" || pInput === "") {
                                showMsg(["error", "全ての項目を入力してください"])
                                return;
                            }

                            showDialog(false);
                            props.onSubmit({
                                name: tInput,
                                passphrase: pInput,
                                writable: writableSwitch.current?.checked!,
                                removable: removableSwitch.current?.checked!
                            });
                        }}
                    >
                        { props.submitText }
                    </Button>
                </Stack>
            </Paper>
        </Backdrop>
    );
};

export default AlbumSettingsDialog;
