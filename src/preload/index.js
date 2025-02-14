import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {};

const batteryAPI = {
    getBatteryInfo: async () => await ipcRenderer.invoke("get-battery-info"),
    onBatteryUpdate: (callback) => {
        ipcRenderer.removeAllListeners("get-battery-update");
        ipcRenderer.on("get-battery-update", (_event, data) => callback(data));
    },
    requestBatteryStatus: () => {
        ipcRenderer.send("request-battery-status");
    },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("electron", electronAPI);
        contextBridge.exposeInMainWorld("api", api);
        contextBridge.exposeInMainWorld("batteryAPI", batteryAPI);
    } catch (error) {
        console.error(error);
    }
} else {
    window.electron = electronAPI;
    window.api = api;
    window.batteryAPI = batteryAPI;
}
