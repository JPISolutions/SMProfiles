# Node-RED SMProfile Builder

A Node-RED flow for building JSON-LD payloads that conform to SMProfiles for EFM (Electronic Flow Measurement) devices using Modbus communication.

## Quick Start

1. Install the Modbus nodes in Node-RED:
   ```
   npm install node-red-contrib-modbus
   ```

2. Import `modbus-efm-flow.json` into Node-RED

3. Configure your Modbus connection (IP address, port)

4. Edit the **Register Configuration** node to set your register addresses

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Register Configuration                              │
│  (Edit this node to set your register addresses - stored in flow context)   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │     Poll Live Data      │
                       │        (1 sec)          │
                       └────────────┬────────────┘
                                    ▼
                       ┌─────────────────────────┐
                       │  Build Modbus Request   │
                       │  (reads from flow ctx)  │
                       └────────────┬────────────┘
                                    ▼
                       ┌─────────────────────────┐
                       │   Modbus-Flex-Getter    │
                       │   (reads registers)     │
                       └────────────┬────────────┘
                                    ▼
                       ┌─────────────────────────┐
                       │  Parse Modbus Response  │
                       │  (accumulates data)     │
                       └────────────┬────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SMProfile Builders                                  │
│  OrificeGasMeter → MeterRun → FlowComputer (complete JSON-LD document)      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                           MQTT / REST Output
```

## Configuration

### Register Addresses

Edit the **Register Configuration** function node. The `REGISTER_MAP` object defines all register mappings:

```javascript
const REGISTER_MAP = {
    // Format: "propertyName": { address, length, type, scale }

    flowRate:             { address: 0,   length: 2, type: "float32" },
    differentialPressure: { address: 2,   length: 2, type: "float32" },
    staticPressure:       { address: 4,   length: 2, type: "float32" },
    temperature:          { address: 6,   length: 2, type: "float32" },
    // ... add more as you discover them
};
```

**Field Reference:**

| Field | Description | Example |
|-------|-------------|---------|
| `address` | Modbus register address | `100` |
| `length` | Number of registers | `1` (16-bit), `2` (32-bit/float) |
| `type` | Data type | `"float32"`, `"uint16"`, `"int32"` |
| `scale` | Multiplier (optional) | `0.1` to divide by 10 |

**Supported Data Types:**

| Type | Registers | Description |
|------|-----------|-------------|
| `uint16` | 1 | Unsigned 16-bit integer |
| `int16` | 1 | Signed 16-bit integer |
| `uint32` | 2 | Unsigned 32-bit integer |
| `int32` | 2 | Signed 32-bit integer |
| `float32` | 2 | IEEE 754 float (big-endian) |
| `float32sw` | 2 | IEEE 754 float (swapped words) |

### Excluding Properties

To exclude a property from **both** Modbus polling **and** JSON output:

1. Comment out or remove the property from `REGISTER_MAP`
2. Remove it from the `REGISTER_GROUPS.properties` array

```javascript
const REGISTER_MAP = {
    flowRate: { address: 0, length: 2, type: "float32" },
    // energyFlowRate: { address: 18, length: 2, type: "float32" },  // EXCLUDED
};

const REGISTER_GROUPS = {
    liveData: {
        properties: [
            "flowRate",
            // "energyFlowRate",  // EXCLUDED
        ]
    }
};
```

### Static Configuration

Set device identification and location in `DEVICE_CONFIG`:

```javascript
const DEVICE_CONFIG = {
    deviceId: "SCADAPAK-474",
    deviceName: "Well 042 Flow Computer",
    meterId: "SCADAPAK-474-RUN1-METER",
    runId: "SCADAPAK-474-RUN1",
    runNumber: 1,
    runName: "Run 1 - Sales",
    owner: "Your Company",

    // Location
    latitude: 48.2891,
    longitude: -103.4567,
    surfaceLSD: "12-24-048-03W4"
};
```

### Modbus Connection

Configure the **SCADAPack 474** Modbus client node:

- **Host**: Your device IP (e.g., `192.168.1.100`)
- **Port**: `502` (standard Modbus TCP)
- **Unit ID**: Usually `1`

## Output

The flow produces JSON-LD conforming to the SMProfile three-level hierarchy:

```
jpi:FlowComputer (device)
  └─ jpi:hasRun: [
       jpi:MeterRun → jpi:hasMeterConfiguration → jpi:OrificeGasMeter
     ]
```

The `jpi:` namespace (`https://github.com/JPISolutions/SMProfiles/profiles/v1#`) links to the profile definitions:
- `jpi:FlowComputer` → `profiles/flow_computer.jsonld`
- `jpi:MeterRun` → `profiles/meter_run.jsonld`
- `jpi:OrificeGasMeter` → `profiles/orifice_gas_meter.jsonld`

## Troubleshooting

**No data flowing:**
- Check Modbus client connection status
- Verify IP address and port
- Confirm register addresses are correct

**Wrong values:**
- Try `float32sw` if floats look wrong (some devices swap words)
- Check if device uses 0-based or 1-based addressing
- Verify the data type (int vs float)

**Intermittent data:**
- Increase `clientTimeout` in Modbus client config
- Reduce poll frequency
- Check for register address conflicts

## Adding More Runs

To add a second run:

1. Duplicate the OrificeGasMeter and MeterRun function nodes
2. Configure different `msg.runId`, `msg.runNumber`, `msg.meterId`
3. Use a Join node to combine multiple `msg.meterRun` objects
4. Modify Build FlowComputer to accept an array of runs

## Validation

Use the validation tool in the `tools/` directory:

```bash
# Save Node-RED output to file, then:
python validate_profile.py ../node-red-output.jsonld
```
