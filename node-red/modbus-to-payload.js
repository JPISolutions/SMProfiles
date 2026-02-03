// Node-RED Function Node: Modbus to Payload Mapper
// Place this BEFORE the Build OrificeGasMeter node
//
// This node maps raw Modbus register values from a SCADAPack 474
// to the expected payload structure for the SMProfile builders.
//
// Customize the register mappings below to match your SCADAPack configuration.

// Input: msg.payload from Modbus Read node (array of register values)
// Output: msg.payload as structured object for SMProfile builders

// Example: If your Modbus read returns an array of values in order:
// [flowRate, dp, staticP, temp, accumVol, orificeDia, pipeID, ...]

// OPTION 1: If using node-red-contrib-modbus with "getMultipleInputRegisters"
// and you're reading a block of registers, map by index:

/*
const registers = msg.payload;
msg.payload = {
    // Live measurements (real-time values)
    flowRate: registers[0],              // Register 40001
    differentialPressure: registers[1],  // Register 40002
    staticPressure: registers[2],        // Register 40003
    temperature: registers[3],           // Register 40004

    // Totals
    accumulatedVolume: registers[4],     // Register 40005
    currentDayVolume: registers[5],      // Register 40006
    previousDayVolume: registers[6],     // Register 40007
    currentHourVolume: registers[7],     // Register 40008
    previousHourVolume: registers[8],    // Register 40009

    // Configuration (these may be static/read once)
    orificeDiameter: registers[10],      // Register 40011
    pipeInsideDiameter: registers[11],   // Register 40012
    baseTemperature: registers[12],      // Register 40013
    basePressure: registers[13],         // Register 40014
    atmosphericPressure: registers[14],  // Register 40015
    contractHour: registers[15],         // Register 40016

    // Calculated values
    gasDensity: registers[20],           // Register 40021
    compressibility: registers[21],      // Register 40022
    specificGravity: registers[22],      // Register 40023
    energyFlowRate: registers[23],       // Register 40024
    heatingValue: registers[24],         // Register 40025

    // Device health
    cpuLoad: registers[30],              // Register 40031
    memoryUsed: registers[31],           // Register 40032
    batteryVoltage: registers[32],       // Register 40033
    powerSupplyVoltage: registers[33],   // Register 40034
    ambientTemperature: registers[34],   // Register 40035

    // Status (may need bit manipulation)
    meterStatus: decodeStatus(registers[40])
};
*/

// OPTION 2: If using separate Modbus reads joined together
// Each read node outputs to a different msg property

/*
msg.payload = {
    // From flow registers read
    flowRate: msg.flowRegisters[0],
    differentialPressure: msg.flowRegisters[1],
    staticPressure: msg.flowRegisters[2],
    temperature: msg.flowRegisters[3],

    // From totals read
    accumulatedVolume: msg.totalRegisters[0],
    currentDayVolume: msg.totalRegisters[1],

    // From config read (or use flow context for static values)
    orificeDiameter: flow.get("orificeDiameter") || 26.1,
    pipeInsideDiameter: flow.get("pipeInsideDiameter") || 76.1
};
*/

// OPTION 3: If using named object from Modbus Flex Getter
// This assumes you've configured named addresses

const raw = msg.payload;

// Scale factors - adjust based on your SCADAPack configuration
const SCALE = {
    flowRate: 1,        // 1 = m³/hr direct, 0.001 if register is in L/hr
    pressure: 1,        // 1 = kPa direct, 6.89476 if register is in PSI
    temperature: 1,     // 1 = °C direct, apply (x-32)*5/9 if Fahrenheit
    volume: 1,          // 1 = m³ direct, 0.0283168 if register is in SCF
    diameter: 1         // 1 = mm direct, 25.4 if register is in inches
};

// Helper to decode status register to enumeration
function decodeStatus(statusCode) {
    const statusMap = {
        0: "Normal",
        1: "Alarm",
        2: "Fault",
        3: "Offline"
    };
    return statusMap[statusCode] || "Normal";
}

// Build the payload object
// CUSTOMIZE THIS SECTION FOR YOUR REGISTER LAYOUT
msg.payload = {
    // === LIVE MEASUREMENTS ===
    flowRate: (raw.flowRate || 0) * SCALE.flowRate,
    differentialPressure: (raw.dp || raw.differentialPressure || 0) * SCALE.pressure,
    staticPressure: (raw.sp || raw.staticPressure || 0) * SCALE.pressure,
    temperature: (raw.temp || raw.temperature || 0) * SCALE.temperature,

    // === TOTALS ===
    accumulatedVolume: (raw.accumVol || raw.accumulatedVolume || 0) * SCALE.volume,
    currentDayVolume: (raw.todayVol || raw.currentDayVolume || 0) * SCALE.volume,
    previousDayVolume: (raw.yesterdayVol || raw.previousDayVolume || 0) * SCALE.volume,
    currentHourVolume: (raw.hourVol || raw.currentHourVolume || 0) * SCALE.volume,
    previousHourVolume: (raw.prevHourVol || raw.previousHourVolume || 0) * SCALE.volume,

    // === CONFIGURATION (often static - consider using flow context) ===
    orificeDiameter: (raw.orificeDia || flow.get("orificeDiameter") || 26.1) * SCALE.diameter,
    pipeInsideDiameter: (raw.pipeDia || flow.get("pipeInsideDiameter") || 76.1) * SCALE.diameter,
    baseTemperature: raw.baseTemp || flow.get("baseTemperature") || 15.0,
    basePressure: raw.basePress || flow.get("basePressure") || 101.325,
    atmosphericPressure: raw.atmPress || flow.get("atmosphericPressure") || 101.325,
    contractHour: raw.contractHr || flow.get("contractHour") || 8,
    aga3Calculation: flow.get("aga3Calculation") || "AGA3_1992",

    // === CALCULATED VALUES ===
    gasDensity: raw.gasDensity || raw.density,
    compressibility: raw.zFactor || raw.compressibility,
    specificGravity: raw.sg || raw.specificGravity,
    energyFlowRate: raw.energyRate || raw.energyFlowRate,
    heatingValue: raw.hv || raw.heatingValue,

    // === DEVICE HEALTH ===
    cpuLoad: raw.cpuLoad,
    memoryUsed: raw.memUsed || raw.memoryUsed,
    batteryVoltage: raw.battVolt || raw.batteryVoltage,
    powerSupplyVoltage: raw.psVolt || raw.powerSupplyVoltage,
    ambientTemperature: raw.ambTemp || raw.ambientTemperature,
    uptime: raw.uptime,

    // === NETWORK (usually static) ===
    ipAddress: flow.get("ipAddress") || "192.168.1.100",
    modbusAddress: flow.get("modbusAddress") || 1,

    // === LOCATION (static - set in flow context) ===
    location: flow.get("location"),
    latitude: flow.get("latitude"),
    longitude: flow.get("longitude"),
    elevation: flow.get("elevation"),
    surfaceLSD: flow.get("surfaceLSD"),

    // === STATUS ===
    meterStatus: decodeStatus(raw.status || raw.meterStatus || 0)
};

// Pass through configuration from inject or context
msg.deviceId = msg.deviceId || flow.get("deviceId") || "SCADAPAK-474";
msg.deviceName = msg.deviceName || flow.get("deviceName") || "SCADAPack 474";
msg.meterId = msg.meterId || flow.get("meterId") || "SCADAPAK-474-RUN1-METER";
msg.meterName = msg.meterName || flow.get("meterName") || "Run 1 Meter";
msg.runId = msg.runId || flow.get("runId") || "SCADAPAK-474-RUN1";
msg.runNumber = msg.runNumber || flow.get("runNumber") || 1;
msg.runName = msg.runName || flow.get("runName") || "Run 1";
msg.owner = msg.owner || flow.get("owner") || "Your Company";

return msg;
