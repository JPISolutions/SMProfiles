# SM Profile Architecture - Flow Computer Hierarchy

## Overview

The SM Profile architecture is **device-centric**, modeling the flow computer as the primary equipment that contains multiple meter runs, each with meter-specific configurations. Supports both gas and liquid metering.

## Profile Hierarchy

```
FlowComputer
├── Device Information (manufacturer, model, serial, firmware)
├── Network Configuration (IP, MAC, Modbus address)
├── Device Status (CPU, memory, battery, temperature)
└── MeterRun[] (collection)
    ├── Run Information (number, name, type, purpose)
    └── Meter Configuration (specific to meter type)
        ├── OrificeGasMeter (for orifice gas runs)
        ├── LiquidMeter (for turbine, PD, Coriolis, ultrasonic, magnetic runs)
        ├── UltrasonicGasMeter (future - for ultrasonic gas runs)
        └── etc.
```

## The Three Profile Levels

### 1. FlowComputer Profile
**Location**: `profiles/flow_computer.jsonld`

The **primary** profile representing the physical flow computer device (FloBoss ROC800/809, TotalFlow G4/G5, SCADA pack, etc.).

**28 Properties covering**:
- Device identification (name, manufacturer, model, serial, firmware)
- Network configuration (IP, MAC, subnet, gateway, Modbus address)
- Location data (GPS coordinates, elevation, time zone)
- Device health (CPU load, memory usage, battery voltage, temperature)
- Configuration (number of runs, contract hour, atmospheric pressure)
- Operational status

**8 Alarms**:
- Communications fault, power failure, low battery
- High CPU, memory full, clock error
- Configuration error, high temperature

### 2. MeterRun Profile
**Location**: `profiles/meter_run.jsonld`

Represents a **single measurement point** on the flow computer. A ROC809 typically has 8 runs, a G5 might have 16.

**8 Properties covering**:
- Run identification (number, name)
- Meter type (orifice, turbine, ultrasonic, etc.)
- Configuration (enabled/disabled, flow direction, owner, purpose)
- Status

### 3. Meter Type Profiles
**Locations**: 
- `profiles/orifice_gas_meter.jsonld` - Gas metering
- `profiles/liquid_meter.jsonld` - Liquid metering
- Future: ultrasonic gas, vortex, etc.

Meter-specific **configuration and measurements** for each meter type. Different meter types have different properties.

**OrificeGasMeter**: 69 properties
- AGA-3 configuration (plate diameter, pipe diameter, materials, tap types)
- AGA-8 gas composition (21 components)
- Sensor specifications (DP, static pressure, temperature)
- Runtime measurements (flow, energy, pressures, temperature, accumulations)

**LiquidMeter**: 53 properties
- Meter type (turbine, PD, Coriolis, ultrasonic, magnetic)
- Fluid type (crude oil, condensate, water, NGLs, refined products)
- Calibration (meter factor, K-factor, volume correction method)
- Fluid properties (API gravity, density, viscosity, water cut, BS&W)
- Runtime measurements (volumetric/mass flow, gross/net volumes, accumulations)

## JSON Payload Structure

When receiving data from a flow computer, the payload represents the complete device:

```json
{
  "@type": "FlowComputer",
  "DeviceName": "BATTERY-12-FLOBOSS",
  "Manufacturer": "Emerson",
  "Model": "ROC809",
  "SerialNumber": "ROC809-2024-A142",
  "FirmwareVersion": "4.10.2",
  "IPAddress": "192.168.1.100",
  "NumberOfRuns": 3,
  "Status": "Normal",
  
  "hasRun": [
    {
      "@type": "MeterRun",
      "RunNumber": 1,
      "RunName": "WELL-042-SALES",
      "MeterType": "Orifice",
      "Purpose": "Sales",
      "Status": "Normal",
      
      "hasMeterConfiguration": {
        "@type": "OrificeGasMeter",
        "OrificeDiameter": 26.1,
        "PipeInsideDiameter": 76.1,
        "FlowRate": 245.6,
        "DifferentialPressure": 12.4,
        "StaticPressure": 3450.2,
        "Temperature": 18.5,
        "AccumulatedVolume": 1247850.3,
        "Status": "Normal"
      }
    },
    {
      "@type": "MeterRun",
      "RunNumber": 2,
      "RunName": "WELL-042-CHECK",
      "MeterType": "Orifice",
      "Purpose": "Check",
      ...
    },
    {
      "@type": "MeterRun",
      "RunNumber": 3,
      "RunName": "FLARE-METER",
      "MeterType": "Orifice",
      "Purpose": "Flare",
      ...
    }
  ]
}
```

## Benefits of This Architecture

### 1. Complete Device Model
One payload contains the **entire flow computer** - device info, all runs, all measurements. This matches how flow computers actually work.

### 2. Vendor Neutrality
Whether it's a FloBoss ROC809, TotalFlow G5, or custom SCADA pack:
- All map to the same `FlowComputer` profile
- All have `MeterRun` collections
- All meter-specific data uses standard profiles

### 3. Scalability
Easy to add new meter types:
- `OrificeGasMeter` profile (implemented)
- `LiquidMeter` profile (implemented)
- `UltrasonicGasMeter` profile (future)
- `VortexMeter` profile (future)
- MeterRun references them via `hasMeterConfiguration`

### 4. Mixed Meter Types
A single flow computer can have both gas and liquid meters:
- Run 1: Orifice gas meter (sales gas)
- Run 2: Turbine liquid meter (condensate production)
- Run 3: Coriolis liquid meter (water disposal)
- Run 4: Orifice gas meter (flare gas)

Each run's `MeterType` property indicates the configuration type.

### 5. Clear Relationships
```
FlowComputer (1) ----< hasRun (many) ----< MeterRun
                                             |
                                  hasMeterConfiguration (1)
                                             |
                                          Meter Type
                                    (OrificeGasMeter, etc.)
```

## Mapping to Ignition

### Tag Structure
```
Enterprise/
└── Battery-12/
    └── FlowComputer/
        ├── Device/              (FlowComputer properties)
        │   ├── Model
        │   ├── SerialNumber
        │   ├── FirmwareVersion
        │   ├── IPAddress
        │   └── Status
        └── Runs/
            ├── Run1/            (MeterRun properties)
            │   ├── RunName
            │   ├── MeterType
            │   ├── Purpose
            │   └── Meter/       (OrificeGasMeter properties)
            │       ├── FlowRate
            │       ├── DifferentialPressure
            │       ├── StaticPressure
            │       └── AccumulatedVolume
            ├── Run2/
            │   └── Meter/
            └── Run3/
                └── Meter/
```

### UDT Structure
```
FlowComputer_UDT
├── Device (folder)
│   ├── DeviceName (string)
│   ├── Model (string)
│   ├── SerialNumber (string)
│   └── ... (28 device properties)
└── Runs (array of MeterRun_UDT)

MeterRun_UDT
├── RunInfo (folder)
│   ├── RunNumber (int)
│   ├── RunName (string)
│   ├── MeterType (string)
│   └── ... (8 run properties)
└── Meter (OrificeGasMeter_UDT or TurbineMeter_UDT)

OrificeGasMeter_UDT
├── Configuration (folder)
│   ├── AGA3 config...
│   ├── AGA8 composition...
│   └── Sensors...
└── Measurements (folder)
    ├── FlowRate
    ├── Pressures
    └── Accumulations
```

## Data Flow

**1. Flow Computer → SCADA**
```
FloBoss/TotalFlow → Modbus/Ethernet → Ignition Gateway → Parse to FlowComputer profile
```

**2. SCADA → Analytics/Cloud**
```
Ignition → JSON payload (FlowComputer structure) → Cloud platform
```

**3. Multi-vendor Aggregation**
```
Site A: FloBoss → FlowComputer profile
Site B: TotalFlow → FlowComputer profile
Site C: Custom → FlowComputer profile
                ↓
        Analytics sees uniform data
```

## Next Steps for Implementation

1. **Validate profiles**: Run validator on all three profiles
2. **Build converters**: Create tools to convert vendor-specific data to these profiles
3. **Create UDTs**: Build Ignition UDT structure matching this hierarchy
4. **Add meter types**: Extend with TurbineMeter, UltrasonicMeter profiles as needed
5. **Test with real data**: Validate with actual FloBoss/TotalFlow data

## Summary

This architecture:
- Models the **physical reality** (flow computer with multiple runs)
- Provides **vendor neutrality** (works with any flow computer brand)
- Enables **mixed meter types** (different meters on different runs)
- Supports **scalability** (easy to add new meter types)
- Creates **clear semantics** (device → run → meter hierarchy)
