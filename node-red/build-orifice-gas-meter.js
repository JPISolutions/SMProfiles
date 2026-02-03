// Node-RED Function Node: Build OrificeGasMeter
// Builds JSON-LD conforming to jpi:OrificeGasMeter profile
//
// Input: msg.payload containing polled values from SCADAPack 474
// Output: msg.orificeGasMeter containing the OrificeGasMeter object

// Configuration - customize these for your installation
const CONFIG = {
    meterId: msg.meterId || "SCADAPAK-474-RUN1-METER",
    meterName: msg.meterName || "SCADAPak 474 Orifice Meter",
    owner: msg.owner || "Your Company"
};

// Get timestamp
const timestamp = new Date().toISOString();

// Helper function to create a property value with optional unit and timestamp
function propVal(value, unit, includeTimestamp) {
    const obj = { value: value };
    if (unit) obj.unit = unit;
    if (includeTimestamp) obj.timestamp = timestamp;
    return obj;
}

// Build the OrificeGasMeter object
// Uses jpi: namespace to reference the profile definition
const orificeGasMeter = {
    "@id": `jpi:OrificeGasMeter/Instance/${CONFIG.meterId}`,
    "@type": "jpi:OrificeGasMeter",
    "rdfs:label": CONFIG.meterName,
    "jpi:propertyValues": {
        // Identification
        "Name": propVal(CONFIG.meterName),
        "Owner": propVal(CONFIG.owner),

        // Location (if available from config or payload)
        ...(msg.payload.latitude && { "Latitude": propVal(msg.payload.latitude, "unit:DEG") }),
        ...(msg.payload.longitude && { "Longitude": propVal(msg.payload.longitude, "unit:DEG") }),
        ...(msg.payload.elevation && { "Elevation": propVal(msg.payload.elevation, "unit:M") }),
        ...(msg.payload.surfaceLSD && { "SurfaceLSD": propVal(msg.payload.surfaceLSD) }),
        ...(msg.payload.downholeLSD && { "DownholeLSD": propVal(msg.payload.downholeLSD) }),

        // Base conditions
        "BaseTemperature": propVal(msg.payload.baseTemperature || 15.0, "unit:DEG_C"),
        "BasePressure": propVal(msg.payload.basePressure || 101.325, "unit:KiloPA"),
        "AtmosphericPressure": propVal(msg.payload.atmosphericPressure || 101.325, "unit:KiloPA"),
        "Units": propVal(msg.payload.units || "metric"),
        "ContractHour": propVal(msg.payload.contractHour || 8),

        // Calculation standards
        "AGA3_Calculation": propVal(msg.payload.aga3Calculation || "AGA3_1992"),

        // Orifice plate configuration
        "OrificeTapType": propVal(msg.payload.orificeTapType || "Flange"),
        "OrificeDiameter": propVal(msg.payload.orificeDiameter, "unit:MilliM"),
        "OrificeMaterial": propVal(msg.payload.orificeMaterial || "Type_316_Stainless_Steel"),
        "OrificeReferenceTemperature": propVal(msg.payload.orificeRefTemp || 20.0, "unit:DEG_C"),

        // Pipe configuration
        "PipeInsideDiameter": propVal(msg.payload.pipeInsideDiameter, "unit:MilliM"),
        "PipeMaterial": propVal(msg.payload.pipeMaterial || "Carbon_Steel"),
        "PipeReferenceTemperature": propVal(msg.payload.pipeRefTemp || 20.0, "unit:DEG_C"),

        // Gas properties
        "IsentropicExponent": propVal(msg.payload.isentropicExponent || 1.3, "unit:UNITLESS"),
        "Viscosity": propVal(msg.payload.viscosity || 0.010268, "unit:CentiPOISE"),
        "FlowExtension": propVal(msg.payload.flowExtension || "Method_1"),

        // Gas composition (AGA-8) - only include if available
        ...(msg.payload.gasComposition && {
            "AGA8_Units": propVal(msg.payload.gasComposition.units || "molar_fraction"),
            "GasComp_C1": propVal(msg.payload.gasComposition.methane || 0, "unit:UNITLESS"),
            "GasComp_C2": propVal(msg.payload.gasComposition.ethane || 0, "unit:UNITLESS"),
            "GasComp_C3": propVal(msg.payload.gasComposition.propane || 0, "unit:UNITLESS"),
            "GasComp_iC4": propVal(msg.payload.gasComposition.isoButane || 0, "unit:UNITLESS"),
            "GasComp_nC4": propVal(msg.payload.gasComposition.nButane || 0, "unit:UNITLESS"),
            "GasComp_iC5": propVal(msg.payload.gasComposition.isoPentane || 0, "unit:UNITLESS"),
            "GasComp_nC5": propVal(msg.payload.gasComposition.nPentane || 0, "unit:UNITLESS"),
            "GasComp_C6": propVal(msg.payload.gasComposition.hexane || 0, "unit:UNITLESS"),
            "GasComp_C7": propVal(msg.payload.gasComposition.heptane || 0, "unit:UNITLESS"),
            "GasComp_C8": propVal(msg.payload.gasComposition.octane || 0, "unit:UNITLESS"),
            "GasComp_C9": propVal(msg.payload.gasComposition.nonane || 0, "unit:UNITLESS"),
            "GasComp_C10": propVal(msg.payload.gasComposition.decane || 0, "unit:UNITLESS"),
            "GasComp_N2": propVal(msg.payload.gasComposition.nitrogen || 0, "unit:UNITLESS"),
            "GasComp_CO2": propVal(msg.payload.gasComposition.carbonDioxide || 0, "unit:UNITLESS"),
            "GasComp_H2S": propVal(msg.payload.gasComposition.hydrogenSulfide || 0, "unit:UNITLESS"),
            "GasComp_H2": propVal(msg.payload.gasComposition.hydrogen || 0, "unit:UNITLESS"),
            "GasComp_He": propVal(msg.payload.gasComposition.helium || 0, "unit:UNITLESS"),
            "GasComp_H2O": propVal(msg.payload.gasComposition.water || 0, "unit:UNITLESS"),
            "GasComp_CO": propVal(msg.payload.gasComposition.carbonMonoxide || 0, "unit:UNITLESS"),
            "GasComp_O2": propVal(msg.payload.gasComposition.oxygen || 0, "unit:UNITLESS"),
            "GasComp_Ar": propVal(msg.payload.gasComposition.argon || 0, "unit:UNITLESS")
        }),

        // Calculated gas properties (live values)
        ...(msg.payload.gasDensity && { "GasDensity": propVal(msg.payload.gasDensity, "unit:KiloGM-PER-M3", true) }),
        ...(msg.payload.compressibility && { "Compressibility": propVal(msg.payload.compressibility, "unit:UNITLESS", true) }),
        ...(msg.payload.specificGravity && { "SpecificGravity": propVal(msg.payload.specificGravity, "unit:UNITLESS", true) }),

        // Sensor configuration
        ...(msg.payload.dpSensor && {
            "DPSensor_Source": propVal(msg.payload.dpSensor.source),
            "DPSensor_SerialNumber": propVal(msg.payload.dpSensor.serialNumber),
            "DPSensor_MinRange": propVal(msg.payload.dpSensor.minRange || 0, "unit:KiloPA"),
            "DPSensor_MaxRange": propVal(msg.payload.dpSensor.maxRange || 100, "unit:KiloPA")
        }),
        ...(msg.payload.staticPressureSensor && {
            "StaticPressureSensor_Source": propVal(msg.payload.staticPressureSensor.source),
            "StaticPressureSensor_SerialNumber": propVal(msg.payload.staticPressureSensor.serialNumber),
            "StaticPressureSensor_MinRange": propVal(msg.payload.staticPressureSensor.minRange || 0, "unit:KiloPA"),
            "StaticPressureSensor_MaxRange": propVal(msg.payload.staticPressureSensor.maxRange || 10000, "unit:KiloPA"),
            "StaticPressureSensor_TapLocation": propVal(msg.payload.staticPressureSensor.tapLocation || "upstream"),
            "StaticPressureSensor_Type": propVal(msg.payload.staticPressureSensor.type || "gauge")
        }),
        ...(msg.payload.tempSensor && {
            "TempSensor_Source": propVal(msg.payload.tempSensor.source),
            "TempSensor_SerialNumber": propVal(msg.payload.tempSensor.serialNumber),
            "TempSensor_MinRange": propVal(msg.payload.tempSensor.minRange || -40, "unit:DEG_C"),
            "TempSensor_MaxRange": propVal(msg.payload.tempSensor.maxRange || 100, "unit:DEG_C")
        }),

        // LIVE MEASUREMENT VALUES (from Modbus poll)
        "FlowRate": propVal(msg.payload.flowRate, "unit:M3-PER-HR", true),
        "DifferentialPressure": propVal(msg.payload.differentialPressure, "unit:KiloPA", true),
        "StaticPressure": propVal(msg.payload.staticPressure, "unit:KiloPA", true),
        "Temperature": propVal(msg.payload.temperature, "unit:DEG_C", true),

        // Energy values
        ...(msg.payload.energyFlowRate && { "EnergyFlowRate": propVal(msg.payload.energyFlowRate, "unit:GJ-PER-HR", true) }),
        ...(msg.payload.heatingValue && { "HeatingValue": propVal(msg.payload.heatingValue, "unit:MegaJ-PER-M3", true) }),

        // Accumulated totals
        "AccumulatedVolume": propVal(msg.payload.accumulatedVolume || 0, "unit:M3", true),
        ...(msg.payload.accumulatedEnergy && { "AccumulatedEnergy": propVal(msg.payload.accumulatedEnergy, "unit:GigaJ", true) }),

        // Daily/hourly totals
        ...(msg.payload.currentDayVolume && { "CurrentDayVolume": propVal(msg.payload.currentDayVolume, "unit:M3", true) }),
        ...(msg.payload.previousDayVolume && { "PreviousDayVolume": propVal(msg.payload.previousDayVolume, "unit:M3") }),
        ...(msg.payload.currentHourVolume && { "CurrentHourVolume": propVal(msg.payload.currentHourVolume, "unit:M3", true) }),
        ...(msg.payload.previousHourVolume && { "PreviousHourVolume": propVal(msg.payload.previousHourVolume, "unit:M3") }),

        // Status
        "Status": propVal(msg.payload.meterStatus || "Normal", null, true)
    }
};

// Store meter in msg for next node and pass through original payload
msg.orificeGasMeter = orificeGasMeter;
msg.timestamp = timestamp;

return msg;
