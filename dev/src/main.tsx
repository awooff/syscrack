import React from "react";
import ReactDOM from "react-dom/client";
import Syscrack from "./Syscrack";
import Layout from "./components/Layout"
import "./bootstrap.min.css";
import "./global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Syscrack />
  </React.StrictMode>
);
