const { ipcRenderer } = require("electron");
const { join } = require("path");

// Define audio files
const audioHigh = "high.mp3";
const audioLow = "low.mp3";
const chargeToggle = "charge.mp3";

// Initialize previous battery status and notify threshold
let batteryPrevious = { percent: 0, isCharging: false };
let notifyThreshold = { low: 15, high: 80, charging: true };

function showNotification(title) {
    new Notification(title);
}

async function playSound(file) {
    const appInfo = await ipcRenderer.invoke("get-app-info");

    const absolutePath = appInfo.isPackaged
        ? join(appInfo.getAppPath, "resources", "audio", file)
        : "src/assets/audio/" + file;
    const audio = new Audio(absolutePath);

    audio.volume = 1.0;
    audio.play().catch((error) => console.error("Error playing sound:", error));
}

function notificationMonitor(batteryStatus) {
    try {
        // Check if status changed
        if (
            batteryStatus.percent !== batteryPrevious.percent ||
            batteryStatus.isCharging !== batteryPrevious.isCharging
        ) {
            if (
                batteryStatus.percent === notifyThreshold.low &&
                !batteryStatus.isCharging
            ) {
                showNotification(`Battery is at ${batteryStatus.percent}%`);
                playSound(audioLow);
            } else if (
                batteryStatus.percent === notifyThreshold.high &&
                batteryStatus.isCharging
            ) {
                showNotification(`Battery is at ${batteryStatus.percent}%`);
                playSound(audioHigh);
            } else if (
                notifyThreshold.charging &&
                batteryStatus.isCharging !== batteryPrevious.isCharging
            ) {
                showNotification(
                    batteryStatus.isCharging
                        ? "Charging Started"
                        : "Charging Stopped"
                );
                playSound(chargeToggle);
            }

            batteryPrevious = batteryStatus;
        }
    } catch (error) {
        console.error("Error monitoring battery:", error);
    }
}

function monitorBattery() {
    navigator.getBattery().then((battery) => {
        function sendBatteryUpdate() {
            ipcRenderer.send("get-battery-update", {
                percent: (battery.level * 100).toFixed(0),
                isCharging: battery.charging,
            });
        }

        // Initial battery status
        sendBatteryUpdate();

        // Listen for changes
        battery.addEventListener("levelchange", sendBatteryUpdate);
        battery.addEventListener("chargingchange", sendBatteryUpdate);

        // Cleanup function to remove event listeners
        return () => {
            battery.removeEventListener("levelchange", sendBatteryUpdate);
            battery.removeEventListener("chargingchange", sendBatteryUpdate);
        };
    });
}

// Start monitoring battery in the background
monitorBattery();

// Listen for battery updates from the main process
ipcRenderer.on("get-battery-update", (_event, batteryStatus) => {
    notificationMonitor(batteryStatus);
});
