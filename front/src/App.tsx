import { useState, createContext } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import AlbumListPage from "./pages/AlbumList";
import AlbumDetailPage from "./pages/AlbumDetail";
import MsgViewer from "./components/MsgViewer";

type SContextType<T> = [T, React.Dispatch<React.SetStateAction<T>>];

// メッセージ表示用Context
export const MsgContext = createContext({} as SContextType<[string, string]>);

// アルバム設定ダイアログ用Context
export const AlbumSettingsDialogContext = createContext({} as SContextType<boolean>);

const App = () => {
    const location = useLocation();

    const [msg, showMsg] = useState<[string, string]>(["", ""]);

    const [dialogStat, showDialog] = useState<boolean>(false);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: "100vh",
                background: "linear-gradient(45deg, #8bfdf3, #b884f7, #84fad6)",
                backgroundSize: "200% 200%"
            }} 
        >
            <TransitionGroup>
                <CSSTransition
                    key={ location.pathname + location.key }
                    classNames="fade"
                    timeout={400}
                >
                    <MsgContext.Provider value={[ msg, showMsg ]}>
                        <AlbumSettingsDialogContext.Provider value={[dialogStat, showDialog]}>
                            <Routes location={ location }>
                                <Route index         element={ <AlbumListPage/> }/>
                                <Route path="/album" element={ <AlbumDetailPage/> }/>
                            </Routes>
                            <MsgViewer/>
                        </AlbumSettingsDialogContext.Provider>
                    </MsgContext.Provider>
                </CSSTransition>
            </TransitionGroup>
        </div>
    );
}

export default App;
