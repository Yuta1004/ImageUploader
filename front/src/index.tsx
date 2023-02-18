import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import "normalize.css";

import App from "./App";
import "./style/animation.css";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <HashRouter>
            <App/>
        </HashRouter>
    </React.StrictMode>
);
