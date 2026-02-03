# Node-RED SMProfile Builders

Function nodes for building JSON-LD payloads that conform to the SMProfiles for EFM (Electronic Flow Measurement) devices.

## Architecture

These function nodes follow the three-level profile hierarchy:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Modbus Poll                                  │
│              (SCADAPack 474 register values)                        │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Build OrificeGasMeter                             │
│  Creates: sm:OrificeGasMeter with 69 properties                     │
│  - Meter configuration (orifice diameter, pipe size, etc.)          │
│  - Live measurements (flow, DP, pressure, temperature)              │
│  - Totals (accumulated volume, daily/hourly volumes)                │
│  - Gas composition (AGA-8 if available)                             │
│  Output: msg.orificeGasMeter                                        │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Build MeterRun                                 │
│  Creates: sm:MeterRun with 10 properties                            │
│  - Run identification (number, name, type)                          │
│  - Run status and purpose                                           │
│  - Links to meter via sm:hasMeterConfiguration                      │
│  Output: msg.meterRun                                               │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Build FlowComputer                               │
│  Creates: sm:FlowComputer with 28 properties + @context             │
│  - Device identification (name, model, serial)                      │
│  - Network config (IP, Modbus address)                              │
│  - Health monitoring (CPU, memory, voltages)                        │
│  - Contains runs via sm:hasRun array                                │
│  Output: msg.payload (complete JSON-LD document)                    │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MQTT Out / REST API                            │
│  Topic: efm/devices/{deviceId}/data                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Installation

1. Import `example-flow.json` into Node-RED
2. Or copy the function code from the individual `.js` files into your own function nodes

## Required Input Data

Your Modbus polling node should produce `msg.payload` with these properties:

### Minimum Required (for flow calculation):
```javascript
{
  flowRate: 245.6,              // m³/hr - current flow rate
  differentialPressure: 12.4,   // kPa - DP across orifice
  staticPressure: 3450.2,       // kPa - line pressure
  temperature: 18.5,            // °C - flowing temperature
  accumulatedVolume: 1247850.3, // m³ - totalizer
  orificeDiameter: 26.1,        // mm - orifice bore
  pipeInsideDiameter: 76.1      // mm - pipe ID
}
```

### Optional Properties:
```javascript
{
  // Daily/hourly totals
  currentDayVolume: 5420.8,
  previousDayVolume: 8234.5,
  currentHourVolume: 245.6,
  previousHourVolume: 242.1,

  // Energy
  energyFlowRate: 9.84,        // GJ/hr
  heatingValue: 40.05,         // MJ/m³
  accumulatedEnergy: 49914.2,  // GJ

  // Gas properties
  gasDensity: 50.0,            // kg/m³
  compressibility: 0.9842,     // Z-factor
  specificGravity: 0.65,

  // Configuration
  baseTemperature: 15.0,       // °C
  basePressure: 101.325,       // kPa
  atmosphericPressure: 101.325,// kPa
  contractHour: 8,
  aga3Calculation: "AGA3_1992",

  // Location
  location: "Well 042 - Battery 12",
  latitude: 48.2891,
  longitude: -103.4567,
  elevation: 625.3,
  surfaceLSD: "12-24-048-03W4",

  // Device health
  cpuLoad: 15.2,
  memoryUsed: 42.5,
  batteryVoltage: 12.8,
  powerSupplyVoltage: 24.1,
  ambientTemperature: 22.5,
  uptime: 2592000,

  // Network
  ipAddress: "192.168.1.100",
  modbusAddress: 1,

  // Status
  meterStatus: "Normal",       // Normal, Alarm, Fault, Offline
  runStatus: "Normal",
  deviceStatus: "Normal"
}
```

## Configuration

Set these properties on your inject node or before the function nodes:

```javascript
msg.deviceId = "SCADAPAK-474";          // Unique device ID
msg.deviceName = "Well 042 FC";         // Human-readable name
msg.meterId = "SCADAPAK-474-RUN1-METER";
msg.meterName = "Well 042 Sales Meter";
msg.runId = "SCADAPAK-474-RUN1";
msg.runNumber = 1;
msg.runName = "Run 1 - Sales";
msg.owner = "Your Company";
```

## Output Example

The final output conforms to the SMProfile structure with the `jpi:` namespace linking to the profile definitions:

```json
{
  "@context": {
    "jpi": "https://github.com/JPISolutions/SMProfiles/profiles/v1#",
    "sm": "http://cesmii.org/sm/",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "unit": "http://qudt.org/vocab/unit/"
  },
  "@id": "jpi:FlowComputer/Instance/SCADAPAK-474",
  "@type": "jpi:FlowComputer",
  "rdfs:label": "Well 042 Flow Computer",
  "jpi:propertyValues": {
    "DeviceName": { "value": "Well 042 Flow Computer" },
    "Manufacturer": { "value": "Schneider_Electric" },
    "Model": { "value": "SCADAPack 474" },
    "Status": { "value": "Normal", "timestamp": "2025-01-23T14:30:00Z" }
  },
  "jpi:hasRun": [
    {
      "@id": "jpi:MeterRun/Instance/SCADAPAK-474-RUN1",
      "@type": "jpi:MeterRun",
      "jpi:propertyValues": { ... },
      "jpi:hasMeterConfiguration": {
        "@id": "jpi:OrificeGasMeter/Instance/SCADAPAK-474-RUN1-METER",
        "@type": "jpi:OrificeGasMeter",
        "jpi:propertyValues": {
          "FlowRate": { "value": 245.6, "unit": "unit:M3-PER-HR", "timestamp": "..." },
          ...
        }
      }
    }
  ]
}
```

The `jpi:` namespace (`https://github.com/JPISolutions/SMProfiles/profiles/v1#`) provides the semantic link to the profile definitions in this repository:
- `jpi:FlowComputer` → `profiles/flow_computer.jsonld`
- `jpi:MeterRun` → `profiles/meter_run.jsonld`
- `jpi:OrificeGasMeter` → `profiles/orifice_gas_meter.jsonld`

## Adding More Runs

To add a second run later:

1. Duplicate the OrificeGasMeter and MeterRun function nodes
2. Configure different `msg.runId`, `msg.runNumber`, `msg.meterId`
3. Use a Join node to combine multiple `msg.meterRun` objects
4. Modify Build FlowComputer to accept an array of runs

## Validating Output

Use the validation tool in the `tools/` directory:

```bash
# Save Node-RED output to file, then:
python validate_profile.py ../node-red-output.jsonld
```
