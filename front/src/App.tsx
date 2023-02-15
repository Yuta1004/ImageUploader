import { BrowserRouter, Route, Routes } from "react-router-dom";

import AlbumListPage from "./pages/AlbumList";
import AlbumDetailPage from "./pages/AlbumDetail";

const App = () => {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "linear-gradient(45deg, #8bfdf3, #b884f7, #84fad6)",
                backgroundSize: "200% 200%"
            }} 
        >
            <BrowserRouter>
                <Routes>
                    <Route index         element={ <AlbumListPage/> }/>
                    <Route path="/album" element={ <AlbumDetailPage/> }/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
