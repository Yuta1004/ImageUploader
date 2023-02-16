import { Route, Routes, useLocation, NavLink } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import AlbumListPage from "./pages/AlbumList";
import AlbumDetailPage from "./pages/AlbumDetail";

const App = () => {
    const location = useLocation();

    return (
        <div
            style={{
                width: "100vw",
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
                    <Routes location={ location }>
                        <Route index         element={ <AlbumListPage/> }/>
                        <Route path="/album" element={ <AlbumDetailPage/> }/>
                    </Routes>
                </CSSTransition>
            </TransitionGroup>
        </div>
    );
}

export default App;
