# Gas Flow Computer SM Profiles

CESMII Smart Manufacturing profiles for gas flow measurement systems following AGA-3 and AGA-8 standards.

## Architecture

This repo provides **vendor-neutral semantic profiles** for gas flow computers and their meter runs. The architecture is hierarchical:

```
FlowComputer (Device)
  └─ MeterRun[] (Measurement Points)
       └─ Meter Configuration (Type-specific)
```

See [`docs/architecture.md`](docs/architecture.md) for complete details.

## Current Profiles

### 1. FlowComputer (v0.1.0)
**Location**: `profiles/flow_computer.jsonld`

Primary profile for flow computer devices (FloBoss ROC800/809, TotalFlow G4/G5, SCADA packs, etc.) with **28 properties**:

- **Device ID**: Name, manufacturer, model, serial, firmware, hardware revision
- **Network**: IP, MAC, subnet, gateway, Modbus address
- **Location**: GPS coordinates, elevation, time zone
- **Health Monitoring**: CPU load, memory usage, battery/power voltage, temperature
- **Configuration**: Number of runs, contract hour, atmospheric pressure
- **Status**: Device status, active alarm count, uptime
- **8 Standard Alarms**: Comms fault, power failure, low battery, high CPU, memory full, clock error, config error, high temp

### 2. MeterRun (v0.1.0)
**Location**: `profiles/meter_run.jsonld`

Profile for individual meter runs on a flow computer with **8 properties**:

- **Run ID**: Run number, name
- **Configuration**: Meter type, enabled/disabled, flow direction, owner, purpose
- **Status**: Run operational status
- **Relationship**: References meter-specific configuration (OrificeGasMeter, TurbineMeter, etc.)

### 3. OrificeGasMeter (v0.2.0)
**Location**: `profiles/orifice_gas_meter.jsonld`

Vendor-neutral profile for orifice meter configuration and measurements with **69 properties**:

- **Equipment ID**: Name, owner, GPS coordinates, elevation
- **Base Conditions**: Base temp/pressure, atmospheric pressure, contract hour
- **AGA-3 Config**: Calculation method, orifice/pipe specs, materials, tap types, viscosity, isentropic exponent
- **AGA-8 Gas Composition**: All 21 components (H2, He, CO2, H2S, C1-C10, N2, H2O, CO, O2, Ar)
- **Sensor Specs**: Full metadata for DP, static pressure, and temperature sensors
- **Runtime Measurements**: Flow, energy, pressures, temperature, accumulations, status
- **8 Standard Alarms**: Hi/Lo pressure/temp, comms fault, sensor out of range

See [`docs/profile_overview.md`](docs/profile_overview.md) for complete property breakdown.

## Structure

```
SMProfiles/
├── profiles/          # SM Profile definitions (JSON-LD)
│   ├── flow_computer.jsonld
│   ├── meter_run.jsonld
│   └── orifice_gas_meter.jsonld
├── tools/             # Python utilities
│   ├── setup.bat
│   ├── validate_profile.py
│   ├── generate_profile.py
│   └── convert_json.py
├── examples/          # Usage examples
│   ├── flow_computer_instance.jsonld    # Complete device with 3 runs
│   └── input/
│       └── sample_meter_config.json
└── docs/              # Documentation
    ├── architecture.md              # Hierarchy & design
    ├── profile_overview.md          # Property details
    ├── extending_profiles.md        # Adding new meter types
    └── vendor_neutral_approach.md   # Implementation guide
```

## Quick Start

**1. Setup Python environment:**
```bash
cd tools
setup.bat
venv\Scripts\activate.bat
```

**2. Validate profiles:**
```bash
python validate_profile.py ..\profiles\flow_computer.jsonld
python validate_profile.py ..\profiles\meter_run.jsonld
python validate_profile.py ..\profiles\orifice_gas_meter.jsonld
```

**3. View complete example:**
```bash
type ..\examples\flow_computer_instance.jsonld
```

This shows a FloBoss ROC809 with 3 orifice meter runs (sales, check, flare).

## Example: FlowComputer with Multiple Runs

```json
{
  "@type": "FlowComputer",
  "DeviceName": "BATTERY-12-FLOBOSS",
  "Manufacturer": "Emerson",
  "Model": "ROC809",
  "SerialNumber": "ROC809-2024-A142",
  "NumberOfRuns": 3,
  "Status": "Normal",
  
  "hasRun": [
    {
      "@type": "MeterRun",
      "RunNumber": 1,
      "RunName": "WELL-042-SALES",
      "MeterType": "Orifice",
      "Purpose": "Sales",
      
      "hasMeterConfiguration": {
        "@type": "OrificeGasMeter",
        "OrificeDiameter": 26.1,
        "FlowRate": 245.6,
        "DifferentialPressure": 12.4,
        "AccumulatedVolume": 1247850.3
      }
    },
    // ... additional runs
  ]
}
```

## What's Included

### Complete Device Model
One JSON payload represents the **entire flow computer** including:
- Device information and health
- All configured meter runs
- All meter-specific configurations
- All real-time measurements

### Vendor Neutrality
**FloBoss ROC800/809** → Maps to FlowComputer profile  
**TotalFlow G4/G5** → Maps to FlowComputer profile  
**SCADA packs** → Map to FlowComputer profile  
**Custom implementations** → Map to FlowComputer profile

Build vendor-specific adapters that map to these standard profiles. Your SCADA/analytics only knows the standard model.

### AGA Compliance
Full support for:
- **AGA-3**: 1985, 1992, 2013 calculation standards
- **AGA-8**: Complete 21-component gas composition
- Flange, pipe, and corner tap configurations
- Material thermal expansion compensation

### Mixed Meter Types
A single flow computer can have different meter types on different runs:
- Run 1: Orifice (sales)
- Run 2: Turbine (check)
- Run 3: Orifice (flare)

Easy to extend with new meter type profiles (turbine, ultrasonic, coriolis).

## Usage

### For SCADA Integration
1. Map your FloBoss/TotalFlow tags to the FlowComputer hierarchy
2. Build Ignition UDTs matching this structure
3. Parse incoming data to conform to these profiles
4. Expose standardized data to HMI, historians, and analytics

### For System Interoperability
Use these profiles as canonical data models:
- All flow computers export data in this format
- All downstream systems consume this format
- Vendor changes don't affect your SCADA layer

### For Adding Meter Types
1. Use `generate_profile.py` to create skeleton
2. Add meter-specific properties (following orifice meter as template)
3. Reference from MeterRun via `hasMeterConfiguration`

## Tools

### validate_profile.py
Validates SM Profiles for syntax, structure, required fields, and unit consistency. Generates detailed validation reports.

### generate_profile.py
Interactive tool for creating new equipment profiles. Prompts for equipment type, properties, and units, then generates valid SM Profile skeleton.

### convert_json.py
Converts original JSON meter configurations to SM Profile instance format. Automatically maps all properties including AGA-3/AGA-8 params, sensor specs, and gas composition.

```bash
python convert_json.py examples/input/sample_meter_config.json output.jsonld METER-001
```

## Documentation

- **[`architecture.md`](docs/architecture.md)**: Complete hierarchy explanation with mapping examples
- **[`profile_overview.md`](docs/profile_overview.md)**: Detailed property breakdown for each profile
- **[`extending_profiles.md`](docs/extending_profiles.md)**: Guide for adding turbine, ultrasonic, coriolis meter types
- **[`vendor_neutral_approach.md`](docs/vendor_neutral_approach.md)**: Implementation strategy

## Next Steps

1. **Validate** existing profiles
2. **Map** your vendor-specific data to FlowComputer structure
3. **Build** Ignition UDTs matching the hierarchy
4. **Extend** with additional meter types (turbine, ultrasonic, coriolis)
5. **Test** with real FloBoss/TotalFlow data

## Real-World Application

**Before** (vendor-locked):
```
FloBoss tags → Custom Ignition UDT → Custom HMI
TotalFlow tags → Different UDT → Different HMI
```

**After** (standardized):
```
FloBoss tags ──┐
TotalFlow tags ├─→ FlowComputer profile → Standard UDT → Unified HMI/Analytics
Custom tags ───┘
```

Built for Alberta oil & gas field operations with Directive 017 compliance in mind.
