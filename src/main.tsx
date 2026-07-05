import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RgbEffectProvider } from "./context/RgbEffectContext";
import { HotkeyProvider } from "./context/HotkeyContext";
import { AppLauncherProvider } from "./context/AppLauncherContext";
import { SystemBehaviorProvider } from "./context/SystemBehaviorContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <SystemBehaviorProvider>
        <RgbEffectProvider>
          <HotkeyProvider>
            <AppLauncherProvider>
              <App />
            </AppLauncherProvider>
          </HotkeyProvider>
        </RgbEffectProvider>
      </SystemBehaviorProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
