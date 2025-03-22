import {
    app,
    shell,
    BrowserWindow,
    ipcMain,
    Menu,
    nativeImage,
    Tray,
} from "electron";
import { join } from "path";
import si from "systeminformation";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import Store from "electron-store";

const store = new Store({
    low: {
        type: "number",
        maximum: 50,
        minimum: 1,
        default: 15,
    },
    high: {
        type: "number",
        maximum: 100,
        minimum: 51,
        default: 80,
    },
    charging: {
        type: "boolean",
        default: true,
    },
});

const icon = join(app.getAppPath(), "resources", "icon.png");

let batteryStatus = { percent: 0, isCharging: false };
let mainWindow = null;
let backgroundWindow = null;
let tray = null;

function createTray() {
    const trayicon = nativeImage.createFromPath(icon);
    tray = new Tray(trayicon.resize({ width: 16 }));
    tray.setToolTip("Battery Alarm");

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show App",
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.setSkipTaskbar(false);
                } else {
                    createWindow();
                }
            },
        },
        {
            label: "Quit",
            click: () => {
                if (tray) {
                    tray.destroy();
                    tray = null;
                }
                app.quit();

                process.exit(0);
            },
        },
    ]);

    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.setSkipTaskbar(false);
        }
    });
}

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        icon: icon,
        webPreferences: {
            preload: join(__dirname, "../preload/index.mjs"),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.on("close", (event) => {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });
    mainWindow.webContents.openDevTools();

    if (!backgroundWindow) {
        // Create a hidden background window
        backgroundWindow = new BrowserWindow({
            show: false,
            icon: icon,
            webPreferences: {
                preload: join(__dirname, "../preload/index.mjs"),
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        // backgroundWindow.webContents.openDevTools();
    }

    if (!tray) {
        createTray();
    }

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
        backgroundWindow.loadURL(
            `${process.env["ELECTRON_RENDERER_URL"]}/background.html`
        );
    } else {
        mainWindow.loadFile(join(__dirname, `../renderer/index.html`));
        backgroundWindow.loadFile(
            join(__dirname, `../renderer/background.html`)
        );
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId("com.electron");

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    createWindow();

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    ipcMain.handle("get-battery-info", async () => {
        try {
            return await si.battery();
        } catch (error) {
            console.error("Error fetching battery data:", error);
            return null;
        }
    });

    ipcMain.on("get-battery-update", (_event, batteryData) => {
        batteryStatus = batteryData;

        // Send to all renderer processes
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send("get-battery-update", batteryStatus);
        });
    });

    // Handle request for initial battery status
    ipcMain.on("request-battery-status", (event) => {
        event.sender.send("get-battery-update", batteryStatus);
    });

    // App isBuilt info
    ipcMain.handle("get-app-info", () => ({
        isPackaged: app.isPackaged,
        getAppPath: app.getAppPath(),
    }));

    // Store
    ipcMain.handle("electron-store-get", (_event, key) => {
        return store.get(key);
    });

    ipcMain.handle("electron-store-set", (_event, key, value) => {
        store.set(key, value);
        return true;
    });

    ipcMain.handle("electron-store-delete", (_event, key) => {
        store.delete(key);
        return true;
    });

    // Notify renderer when a value changes
    store.onDidChange("high", (newValue) => {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send("electron-store-changed", {
                key: "high",
                value: newValue,
            });
        });
    });

    store.onDidChange("low", (newValue) => {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send("electron-store-changed", {
                key: "low",
                value: newValue,
            });
        });
    });

    store.onDidChange("charging", (newValue) => {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send("electron-store-changed", {
                key: "charging",
                value: newValue,
            });
        });
    });
});

app.on("before-quit", () => {
    app.removeAllListeners();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform === "darwin") {
        app.hide();
    } else {
        if (mainWindow) mainWindow.hide();
    }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
