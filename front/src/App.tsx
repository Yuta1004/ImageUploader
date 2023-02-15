import { BrowserRouter, Route, Routes } from "react-router-dom";

import AlbumListPage from "./pages/AlbumList";
import AlbumDetailPage from "./pages/AlbumDetail";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route index         element={ <AlbumListPage/> }/>
                <Route path="/album" element={ <AlbumDetailPage/> }/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
