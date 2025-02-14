import { ChargingIcon } from "./assets/img/svg";
import { useEffect, useState } from "react";

function TableRow({ name, value, classHead, classData }) {
    return (
        <tr>
            <th className={classHead}>{name}</th>
            <td className={classData}>{value}</td>
        </tr>
    );
}

function Battery({ batteryStatus }) {
    return (
        <div className="battery">
            <div
                className={`battery-level ${batteryStatus.percent < 15 ? "alert" : batteryStatus.percent < 25 ? "warn" : ""}`}
                style={{ height: `${batteryStatus.percent}%` }}
            />
            {batteryStatus.isCharging && (
                <ChargingIcon
                    className="charging"
                    style={{ color: "#fcec03" }}
                />
            )}
        </div>
    );
}

function BatteryStatus({ batteryStatus, batteryInfo }) {
    return (
        <div className="info-brief">
            <table>
                <tbody className="table-body">
                    <TableRow
                        name="Status"
                        value={
                            batteryStatus.isCharging
                                ? "Charging"
                                : "Not Charging"
                        }
                    />
                    <TableRow
                        name="Level"
                        value={`${batteryStatus.percent}%`}
                    />
                    <TableRow
                        name="Time Remaining"
                        value={
                            batteryInfo.timeRemaining
                                ? `${Math.floor(
                                      batteryInfo.timeRemaining / 60
                                  )} minutes`
                                : "N/A"
                        }
                    />
                </tbody>
            </table>
        </div>
    );
}

function BatterySection({ children }) {
    return <div className="battery-section">{children}</div>;
}

function BatteryInformation({ batteryInfo, batteryStatus }) {
    const healthColor = (level) => {
        if (level < 50) {
            return "alert";
        } else if (level < 80) {
            return "warn";
        } else {
            return "";
        }
    };

    const health = (
        (batteryInfo.maxCapacity / batteryInfo.designedCapacity) *
        100
    ).toFixed(0);

    return (
        <>
            <h2 className="title">Battery Information</h2>
            <div className="infoContent">
                <table>
                    <tbody className="table-body">
                        <TableRow
                            name="Health"
                            value={`${health}%`}
                            classData={`level ${healthColor(health)}`}
                        />
                        <TableRow
                            name="Capacity"
                            value={`${(
                                (batteryInfo.maxCapacity *
                                    batteryStatus.percent) /
                                100
                            ).toFixed(0)}
                            ${batteryInfo.capacityUnit}`}
                        />
                        <TableRow
                            name="Max Capacity"
                            value={`${batteryInfo.maxCapacity}
                            ${batteryInfo.capacityUnit}`}
                        />
                        <TableRow
                            name="Designed Capacity"
                            value={`${batteryInfo.designedCapacity}
                            ${batteryInfo.capacityUnit}`}
                        />
                        <TableRow
                            name="Voltage"
                            value={`${batteryInfo.voltage}
                            V`}
                        />
                        <TableRow
                            name="Type"
                            value={batteryInfo.type || "N/A"}
                        />
                        <TableRow
                            name="Model"
                            value={batteryInfo.model || "N/A"}
                        />
                    </tbody>
                </table>
            </div>
        </>
    );
}

function AlarmConfiguration({ batteryStatus }) {
    // const [batteryStatusPrev, setBatteryStatusPrev] = useState({
    //     percent: 0,
    //     isCharging: false,
    // });
    // const [notifyThreshold, setNotifyThreshold] = useState({
    //     high: 80,
    //     low: 15,
    //     charging: true,
    // });

    // // Audio playback
    // useEffect(() => {
    //     // Play audio only when values actually change
    //     if (
    //         batteryStatus.percent !== batteryStatusPrev.percent ||
    //         batteryStatus.isCharging !== batteryStatusPrev.isCharging
    //     ) {
    //         if (
    //             batteryStatus.percent !== 0 &&
    //             batteryStatus.percent === notifyThreshold.low &&
    //             !batteryStatus.isCharging
    //         ) {
    //             playSound(audioLow);
    //         } else if (
    //             batteryStatus.percent === notifyThreshold.high &&
    //             batteryStatus.isCharging
    //         ) {
    //             playSound(audioHigh);
    //         } else if (
    //             notifyThreshold.charging &&
    //             batteryStatus.isCharging !== batteryStatusPrev.isCharging
    //         ) {
    //             playSound(chargeToggle);
    //         }

    //         setBatteryStatusPrev((prev) => ({ ...prev, ...batteryStatus }));
    //     }
    // }, [batteryStatus]);

    // const handleCharger = (value) => {
    //     setNotifyThreshold((prev) => ({
    //         ...prev,
    //         charging: value,
    //     }));
    // };

    return (
        <>
            <h2 className="title">Alarm</h2>
            {/* <div className="settingContent">
                <div className="settingItem">
                    Charger Connected
                    <div className="switchcontainer">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notifyThreshold.charging}
                                onChange={(e) =>
                                    handleCharger(e.target.checked)
                                }
                            />
                            <span className="slider round"></span>
                        </label>
                        {notifyThreshold.charging ? "ON" : "OFF"}
                    </div>
                </div>
                <div className="settingItem">
                    Low Battery Alert ({notifyThreshold.low}%)
                    <label className="slidecontainer">
                        <input
                            type="range"
                            min={1}
                            max={50}
                            value={notifyThreshold.low}
                            onChange={(e) => {
                                let newValue = Number(e.target.value);

                                if (newValue < 1) newValue = 1;
                                if (newValue > 50) newValue = 50;

                                setNotifyThreshold((prev) => ({
                                    ...prev,
                                    low: newValue,
                                }));
                            }}
                        />
                    </label>
                </div>
                <div className="settingItem">
                    Full Battery Alert ({notifyThreshold.high}%)
                    <label className="slidecontainer">
                        <input
                            type="range"
                            min={51}
                            max={100}
                            value={notifyThreshold.high}
                            className="input-number"
                            onChange={(e) => {
                                let newValue = Number(e.target.value);

                                if (newValue < 51) newValue = 51;
                                if (newValue > 100) newValue = 100;

                                setNotifyThreshold((prev) => ({
                                    ...prev,
                                    high: newValue,
                                }));
                            }}
                        />
                    </label>
                </div>
            </div> */}
        </>
    );
}

function App() {
    const [batteryInfo, setBatteryInfo] = useState({
        maxCapacity: 0,
        designedCapacity: 0,
        timeRemaining: 0,
        voltage: 0,
        capacityUnit: "mAh",
        type: "",
        model: "",
    });
    const [batteryStatus, setBatteryStatus] = useState({
        percent: 0,
        isCharging: false,
    });

    // Update battery info once and auto loop percentage
    useEffect(() => {
        // Fetch battery specs (one-time)
        async function fetchBatteryData() {
            const data = await window.batteryAPI.getBatteryInfo();
            setBatteryInfo(data);
        }

        fetchBatteryData();

        // Request battery status when the app starts
        window.batteryAPI.requestBatteryStatus();

        // Listen for live updates from Battery API
        window.batteryAPI.onBatteryUpdate((newBattery) => {
            setBatteryStatus(newBattery);
        });
    }, []);

    return (
        <main>
            <BatterySection>
                <Battery batteryStatus={batteryStatus} />
                <BatteryStatus
                    batteryInfo={batteryInfo}
                    batteryStatus={batteryStatus}
                />
            </BatterySection>
            <div className="info">
                <BatteryInformation
                    batteryInfo={batteryInfo}
                    batteryStatus={batteryStatus}
                />
                <AlarmConfiguration batteryStatus={batteryStatus} />
            </div>
        </main>
    );
}

export default App;
