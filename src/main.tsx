import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RgbEffectProvider } from "./context/RgbEffectContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RgbEffectProvider>
      <App />
    </RgbEffectProvider>
  </React.StrictMode>,
);
