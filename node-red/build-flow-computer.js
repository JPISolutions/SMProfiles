// Node-RED Function Node: Build FlowComputer
// Builds complete JSON-LD conforming to jpi:FlowComputer profile
//
// Input: msg.meterRun (from previous function node)
//        msg.payload containing device-level data
// Output: msg.payload containing complete JSON-LD document ready for MQTT/REST

// Configuration - customize these for your SCADAPack 474
const CONFIG = {
    deviceId: msg.deviceId || "SCADAPAK-474",
    deviceName: msg.deviceName || "SCADAPack 474 Flow Computer",
    manufacturer: "Schneider_Electric",
    model: "SCADAPack 474"
};

// Get timestamp (use one from previous node if available)
const timestamp = msg.timestamp || new Date().toISOString();

// Helper function to create a property value with optional unit and timestamp
function propVal(value, unit, includeTimestamp) {
    const obj = { value: value };
    if (unit) obj.unit = unit;
    if (includeTimestamp) obj.timestamp = timestamp;
    return obj;
}

// Determine overall device status from runs
let deviceStatus = "Normal";
let activeAlarmCount = 0;

if (msg.meterRun) {
    const runStatus = msg.meterRun["jpi:propertyValues"]?.Status?.value;
    if (runStatus === "Fault") {
        deviceStatus = "Fault";
        activeAlarmCount++;
    } else if (runStatus === "Alarm") {
        deviceStatus = "Alarm";
        activeAlarmCount++;
    }
}

// Override with explicit status from payload if provided
if (msg.payload.deviceStatus) {
    deviceStatus = msg.payload.deviceStatus;
}
if (msg.payload.activeAlarmCount !== undefined) {
    activeAlarmCount = msg.payload.activeAlarmCount;
}

// Build the FlowComputer JSON-LD document
// The jpi: namespace provides the semantic link to the profile definitions
const flowComputer = {
    "@context": {
        "jpi": "https://github.com/JPISolutions/SMProfiles/profiles/v1#",
        "sm": "http://cesmii.org/sm/",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "unit": "http://qudt.org/vocab/unit/"
    },
    "@id": `jpi:FlowComputer/Instance/${CONFIG.deviceId}`,
    "@type": "jpi:FlowComputer",
    "rdfs:label": CONFIG.deviceName,
    "jpi:propertyValues": {
        // Device identification
        "DeviceName": propVal(CONFIG.deviceName),
        "Manufacturer": propVal(CONFIG.manufacturer),
        "Model": propVal(CONFIG.model),
        ...(msg.payload.serialNumber && { "SerialNumber": propVal(msg.payload.serialNumber) }),
        ...(msg.payload.firmwareVersion && { "FirmwareVersion": propVal(msg.payload.firmwareVersion) }),
        ...(msg.payload.hardwareRevision && { "HardwareRevision": propVal(msg.payload.hardwareRevision) }),

        // Network configuration
        ...(msg.payload.ipAddress && { "IPAddress": propVal(msg.payload.ipAddress) }),
        ...(msg.payload.macAddress && { "MACAddress": propVal(msg.payload.macAddress) }),
        ...(msg.payload.subnetMask && { "SubnetMask": propVal(msg.payload.subnetMask) }),
        ...(msg.payload.gateway && { "Gateway": propVal(msg.payload.gateway) }),
        ...(msg.payload.modbusAddress && { "ModbusAddress": propVal(msg.payload.modbusAddress) }),

        // Location
        ...(msg.payload.location && { "Location": propVal(msg.payload.location) }),
        ...(msg.payload.latitude && { "Latitude": propVal(msg.payload.latitude, "unit:DEG") }),
        ...(msg.payload.longitude && { "Longitude": propVal(msg.payload.longitude, "unit:DEG") }),
        ...(msg.payload.elevation && { "Elevation": propVal(msg.payload.elevation, "unit:M") }),
        ...(msg.payload.surfaceLSD && { "SurfaceLSD": propVal(msg.payload.surfaceLSD) }),
        ...(msg.payload.downholeLSD && { "DownholeLSD": propVal(msg.payload.downholeLSD) }),

        // Time
        ...(msg.payload.timeZone && { "TimeZone": propVal(msg.payload.timeZone) }),
        "CurrentDateTime": propVal(timestamp),
        ...(msg.payload.uptime && { "Uptime": propVal(msg.payload.uptime, "unit:SEC") }),

        // Configuration
        "NumberOfRuns": propVal(msg.meterRun ? 1 : 0), // Currently configured for 1 run
        ...(msg.payload.contractHour && { "ContractHour": propVal(msg.payload.contractHour) }),
        ...(msg.payload.atmosphericPressure && { "AtmosphericPressure": propVal(msg.payload.atmosphericPressure, "unit:KiloPA") }),

        // Health monitoring (live values)
        ...(msg.payload.cpuLoad && { "CPULoad": propVal(msg.payload.cpuLoad, "unit:PERCENT", true) }),
        ...(msg.payload.memoryUsed && { "MemoryUsed": propVal(msg.payload.memoryUsed, "unit:PERCENT", true) }),
        ...(msg.payload.batteryVoltage && { "BatteryVoltage": propVal(msg.payload.batteryVoltage, "unit:V", true) }),
        ...(msg.payload.powerSupplyVoltage && { "PowerSupplyVoltage": propVal(msg.payload.powerSupplyVoltage, "unit:V", true) }),
        ...(msg.payload.ambientTemperature && { "AmbientTemperature": propVal(msg.payload.ambientTemperature, "unit:DEG_C", true) }),

        // Status
        "Status": propVal(deviceStatus, null, true),
        "ActiveAlarmCount": propVal(activeAlarmCount)
    }
};

// Attach meter runs using the profile relationship
if (msg.meterRun) {
    flowComputer["jpi:hasRun"] = [msg.meterRun];
}

// Replace payload with the complete JSON-LD document
msg.payload = flowComputer;

// Optionally set MQTT topic based on device ID
msg.topic = msg.topic || `efm/devices/${CONFIG.deviceId}/data`;

return msg;
