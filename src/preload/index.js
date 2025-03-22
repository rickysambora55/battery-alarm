import { contextBridge, ipcRenderer, shell } from "electron";
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

const storeAPI = {
    get: (key) => ipcRenderer.invoke("electron-store-get", key),
    set: (key, value) => ipcRenderer.invoke("electron-store-set", key, value),
    delete: (key) => ipcRenderer.invoke("electron-store-delete", key),
    onDidChange: (callback) => {
        ipcRenderer.removeAllListeners("electron-store-changed");
        ipcRenderer.on("electron-store-changed", (_event, { key, value }) => {
            callback(key, value);
        });
    },
};

const openLink = {
    openExternal: (url) => shell.openExternal(url),
};

const notificationAPI = {
    sendNotification: (message) =>
        ipcRenderer.send("show-notification", { message }),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("electron", electronAPI);
        contextBridge.exposeInMainWorld("api", api);
        contextBridge.exposeInMainWorld("batteryAPI", batteryAPI);
        contextBridge.exposeInMainWorld("electronStore", storeAPI);
        contextBridge.exposeInMainWorld("openLink", openLink);
        contextBridge.exposeInMainWorld("showNotification", notificationAPI);
    } catch (error) {
        console.error(error);
    }
} else {
    window.electron = electronAPI;
    window.api = api;
    window.batteryAPI = batteryAPI;
    window.electronStore = storeAPI;
    window.openLink = openLink;
    window.showNotification = notificationAPI;
}
