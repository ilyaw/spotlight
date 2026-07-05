import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RgbEffectProvider } from "./context/RgbEffectContext";
import { HotkeyProvider } from "./context/HotkeyContext";
import { AppLauncherProvider } from "./context/AppLauncherContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <RgbEffectProvider>
        <HotkeyProvider>
          <AppLauncherProvider>
            <App />
          </AppLauncherProvider>
        </HotkeyProvider>
      </RgbEffectProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
