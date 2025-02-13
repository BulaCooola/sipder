import { contextBridge } from "electron";

// Example of exposing safe APIs to the renderer
contextBridge.exposeInMainWorld("electron", {
  appVersion: () => "1.0.0",
});
