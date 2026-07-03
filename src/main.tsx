import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RgbEffectProvider } from "./context/RgbEffectContext";
import { QuickLaunchProvider } from "./context/QuickLaunchContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RgbEffectProvider>
      <QuickLaunchProvider>
        <App />
      </QuickLaunchProvider>
    </RgbEffectProvider>
  </React.StrictMode>,
);
