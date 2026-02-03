// Node-RED Function Node: Build MeterRun
// Builds JSON-LD conforming to jpi:MeterRun profile
//
// Input: msg.orificeGasMeter (from previous function node)
//        msg.payload containing run configuration
// Output: msg.meterRun containing the MeterRun object with nested meter

// Configuration - customize these for your installation
const CONFIG = {
    runId: msg.runId || "SCADAPAK-474-RUN1",
    runNumber: msg.runNumber || 1,
    runName: msg.runName || "Run 1 - Sales",
    owner: msg.owner || "Your Company"
};

// Get timestamp (use one from previous node if available)
const timestamp = msg.timestamp || new Date().toISOString();

// Helper function to create a property value
function propVal(value, unit, includeTimestamp) {
    const obj = { value: value };
    if (unit) obj.unit = unit;
    if (includeTimestamp) obj.timestamp = timestamp;
    return obj;
}

// Determine meter type from the meter object if available
let meterType = "Orifice"; // Default for your SCADAPack orifice setup
if (msg.orificeGasMeter) {
    meterType = "Orifice";
} else if (msg.liquidMeter) {
    meterType = "Turbine"; // or could be Coriolis, Ultrasonic, etc.
}

// Determine run status based on meter status
let runStatus = "Normal";
if (msg.payload.runStatus) {
    runStatus = msg.payload.runStatus;
} else if (msg.orificeGasMeter && msg.orificeGasMeter["jpi:propertyValues"]?.Status?.value) {
    const meterStatus = msg.orificeGasMeter["jpi:propertyValues"].Status.value;
    if (meterStatus === "Fault" || meterStatus === "Offline") {
        runStatus = "Fault";
    } else if (meterStatus === "Alarm") {
        runStatus = "Alarm";
    }
}

// Build the MeterRun object
// Uses jpi: namespace to reference the profile definition
const meterRun = {
    "@id": `jpi:MeterRun/Instance/${CONFIG.runId}`,
    "@type": "jpi:MeterRun",
    "rdfs:label": CONFIG.runName,
    "jpi:propertyValues": {
        "RunNumber": propVal(CONFIG.runNumber),
        "RunName": propVal(CONFIG.runName),
        "MeterType": propVal(meterType),
        "Enabled": propVal(msg.payload.runEnabled !== undefined ? msg.payload.runEnabled : true),
        "FlowDirection": propVal(msg.payload.flowDirection || "Forward"),
        "Owner": propVal(CONFIG.owner),

        // Location (LSD) if available
        ...(msg.payload.surfaceLSD && { "SurfaceLSD": propVal(msg.payload.surfaceLSD) }),
        ...(msg.payload.downholeLSD && { "DownholeLSD": propVal(msg.payload.downholeLSD) }),

        "Purpose": propVal(msg.payload.purpose || "Sales"),
        "Status": propVal(runStatus, null, true)
    }
};

// Attach the meter configuration using the profile relationship
if (msg.orificeGasMeter) {
    meterRun["jpi:hasMeterConfiguration"] = msg.orificeGasMeter;
} else if (msg.liquidMeter) {
    meterRun["jpi:hasMeterConfiguration"] = msg.liquidMeter;
}

// Store meter run in msg for next node
msg.meterRun = meterRun;
msg.timestamp = timestamp;

return msg;
