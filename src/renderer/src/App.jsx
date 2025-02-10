import logo from "./assets/img/icon.svg";
import { useEffect, useState } from "react";
import highAlert from "./assets/audio/high.mp3";
import lowAlert from "./assets/audio/low.mp3";
import charge from "./assets/audio/charge.mp3";

const audioHigh = new Audio(highAlert);
const audioLow = new Audio(lowAlert);
const chargeToggle = new Audio(charge);

function playSound(audio) {
    audio.play().catch((err) => console.error("Audio play failed:", err));
}

function App() {
    const [batteryInfo, setBatteryInfo] = useState({
        level: 0,
        charging: false,
        chargingTime: 0,
        dischargingTime: 0,
    });

    useEffect(() => {
        navigator.getBattery().then((battery) => {
            function updateAllBatteryInfo() {
                updateChargeInfo();
                updateLevelInfo();
                updateChargingInfo();
                updateDischargingInfo();
            }
            updateAllBatteryInfo();

            battery.addEventListener("chargingchange", updateChargeInfo);
            battery.addEventListener("levelchange", updateLevelInfo);
            battery.addEventListener("chargingtimechange", updateChargingInfo);
            battery.addEventListener(
                "dischargingtimechange",
                updateDischargingInfo
            );

            function updateChargeInfo() {
                if (battery.charging !== batteryInfo.charging) {
                    playSound(chargeToggle);
                }

                setBatteryInfo((prev) => ({
                    ...prev,
                    charging: battery.charging,
                }));
            }

            function updateLevelInfo() {
                const newLevel = Math.floor(battery.level * 100);

                if (newLevel === 20) {
                    playSound(audioLow);
                }
                if (newLevel === 80) {
                    playSound(audioHigh);
                }

                setBatteryInfo((prev) => ({
                    ...prev,
                    level: newLevel,
                }));
            }

            function updateChargingInfo() {
                setBatteryInfo((prev) => ({
                    ...prev,
                    chargingTime: battery.chargingTime,
                }));
            }

            function updateDischargingInfo() {
                setBatteryInfo((prev) => ({
                    ...prev,
                    dischargingTime: battery.dischargingTime,
                }));
            }

            return () => {
                battery.removeEventListener("chargingchange", updateChargeInfo);
                battery.removeEventListener("levelchange", updateLevelInfo);
                battery.removeEventListener(
                    "chargingtimechange",
                    updateChargingInfo
                );
                battery.removeEventListener(
                    "dischargingtimechange",
                    updateDischargingInfo
                );
            };
        });
    }, []);

    return (
        <main>
            <img alt="logo" className="logo" src={logo} />
            <div className="charging">
                {batteryInfo.charging ? "Charging" : "Not Charging"}
            </div>
            <div className="level">{batteryInfo.level}%</div>
        </main>
    );
}

export default App;
