# SM Profile Overview

This document provides an overview of all available SM Profiles in the repository. For detailed property breakdowns, see the individual profile documentation.

## Profile Hierarchy

```
FlowComputer (Device)
  └─ MeterRun[] (Measurement Points)
       └─ Meter Configuration (Type-specific)
            ├─ OrificeGasMeter (Gas metering)
            ├─ LiquidMeter (Liquid metering)
            └─ [Future meter types...]
```

## Core Profiles

### Device & Run Profiles

#### FlowComputer (v0.1.0)
**File**: `profiles/flow_computer.jsonld`  
**Properties**: 28  
**Purpose**: Top-level device profile for flow computers

The FlowComputer profile represents the physical flow computer device (FloBoss, TotalFlow, SCADA pack, etc.) and includes:
- Device identification (name, manufacturer, model, serial, firmware)
- Network configuration (IP, MAC, Modbus address)
- Location data (GPS, elevation, time zone)
- Health monitoring (CPU, memory, battery, temperature)
- Configuration (number of runs, contract hour)
- Status and alarms

#### MeterRun (v0.1.0)
**File**: `profiles/meter_run.jsonld`  
**Properties**: 8  
**Purpose**: Represents individual meter runs on a flow computer

The MeterRun profile links a flow computer to its meter configurations and includes:
- Run identification (run number, name)
- Configuration (meter type, enabled status, flow direction)
- Ownership and purpose
- Reference to type-specific meter configuration

### Meter Configuration Profiles

#### OrificeGasMeter (v0.2.0)
**File**: `profiles/orifice_gas_meter.jsonld`  
**Properties**: 69  
**Purpose**: AGA-3/AGA-8 compliant orifice gas meter configuration

**[Full Documentation](orifice_gas_meter_overview.md)**

Comprehensive profile for orifice gas meters including:
- Equipment identification and location
- Base conditions and unit system
- AGA-3 configuration (orifice/pipe specs, materials, tap types)
- AGA-8 gas composition (21 components)
- Sensor metadata (DP, static pressure, temperature)
- Runtime measurements (flow, energy, pressures, accumulations)
- 8 standard alarms

**Key Features:**
- Full AGA-3 compliance (1985, 1992, 2013 standards)
- Complete AGA-8 gas composition support
- Material thermal expansion compensation
- Multiple tap type support (flange, pipe, corner)
- Energy measurement and heating value
- Compressibility factor calculations

#### LiquidMeter (v0.1.0)
**File**: `profiles/liquid_meter.jsonld`  
**Properties**: 53  
**Purpose**: Vendor-neutral liquid meter configuration

**[Full Documentation](liquid_meter_overview.md)**

Comprehensive profile for liquid meters including:
- Equipment identification and location
- Meter type selection (turbine, PD, Coriolis, ultrasonic, magnetic)
- Fluid type classification (crude oil, condensate, water, NGLs, refined products)
- Calibration data (meter factor, K-factor)
- Fluid properties (API gravity, density, viscosity, water cut, BS&W)
- Volume correction standards (API MPMS 11.1, API 2540, ISO 91-1)
- Sensor metadata (pressure, temperature, density)
- Runtime measurements (volumetric/mass flow, gross/net volumes, accumulations)
- 12 standard alarms

**Key Features:**
- Multiple meter technology support
- API gravity and density tracking
- Water cut and BS&W monitoring
- CTL/CPL volume correction factors
- Both volumetric and mass measurement
- Salt/sulfur content tracking for crude oil

## Profile Comparison

| Feature | OrificeGasMeter | LiquidMeter |
|---------|----------------|-------------|
| **Fluid Type** | Natural gas | Crude, condensate, water, NGLs |
| **Meter Technologies** | Orifice plate only | Turbine, PD, Coriolis, ultrasonic, magnetic |
| **Properties** | 69 | 53 |
| **Complexity** | High (compression calcs) | Medium (simpler corrections) |
| **Standards** | AGA-3, AGA-8 | API MPMS 11.1, API 2540, ISO 91-1 |
| **Composition** | 21-component gas analysis | API gravity, water cut, BS&W |
| **Pressure Measurement** | Differential + static | Static only |
| **Energy Measurement** | Yes (GJ/hr) | No |
| **Mass Measurement** | No | Yes (Coriolis) |
| **Compressibility** | Yes (Z-factor) | No (incompressible) |

## Quick Property Counts

| Profile | Config Properties | Runtime Properties | Alarms |
|---------|------------------|-------------------|--------|
| FlowComputer | 20 | 8 | 8 |
| MeterRun | 7 | 1 | 0 |
| OrificeGasMeter | 59 | 10 | 8 |
| LiquidMeter | 35 | 8 | 12 |

## Usage Examples

### Gas Metering
```json
{
  "@type": "FlowComputer",
  "DeviceName": "BATTERY-12-FC",
  "NumberOfRuns": 2,
  "hasRun": [
    {
      "@type": "MeterRun",
      "RunNumber": 1,
      "MeterType": "Orifice",
      "Purpose": "Sales",
      "hasMeterConfiguration": {
        "@type": "OrificeGasMeter",
        "OrificeDiameter": 26.1,
        "FlowRate": 245.6,
        "GasComp_C1": 0.934
      }
    }
  ]
}
```

### Liquid Metering
```json
{
  "@type": "FlowComputer",
  "DeviceName": "BATTERY-12-FC",
  "NumberOfRuns": 1,
  "hasRun": [
    {
      "@type": "MeterRun",
      "RunNumber": 1,
      "MeterType": "Turbine",
      "Purpose": "Production",
      "hasMeterConfiguration": {
        "@type": "LiquidMeter",
        "MeterType": "Turbine",
        "FluidType": "Crude_Oil",
        "API_Gravity": 42.3,
        "FlowRate_Volumetric": 125.4,
        "WaterCut": 2.1
      }
    }
  ]
}
```

### Mixed Gas and Liquid
```json
{
  "@type": "FlowComputer",
  "DeviceName": "BATTERY-12-FC",
  "NumberOfRuns": 4,
  "hasRun": [
    {
      "@type": "MeterRun",
      "RunNumber": 1,
      "MeterType": "Orifice",
      "Purpose": "Sales",
      "hasMeterConfiguration": {
        "@type": "OrificeGasMeter"
      }
    },
    {
      "@type": "MeterRun",
      "RunNumber": 2,
      "MeterType": "Turbine",
      "Purpose": "Production",
      "hasMeterConfiguration": {
        "@type": "LiquidMeter",
        "FluidType": "Condensate"
      }
    },
    {
      "@type": "MeterRun",
      "RunNumber": 3,
      "MeterType": "Coriolis",
      "Purpose": "Disposal",
      "hasMeterConfiguration": {
        "@type": "LiquidMeter",
        "FluidType": "Water"
      }
    },
    {
      "@type": "MeterRun",
      "RunNumber": 4,
      "MeterType": "Orifice",
      "Purpose": "Flare",
      "hasMeterConfiguration": {
        "@type": "OrificeGasMeter"
      }
    }
  ]
}
```

## When to Use Which Profile

### Use OrificeGasMeter when:
- Measuring natural gas flow
- AGA-3/AGA-8 compliance required
- Custody transfer or regulatory reporting
- Need energy (BTU) measurements
- Gas composition analysis required
- Differential pressure metering

### Use LiquidMeter when:
- Measuring crude oil, condensate, or produced water
- Using turbine, PD, Coriolis, ultrasonic, or magnetic meters
- API gravity and water cut tracking needed
- Volume correction to standard conditions required
- Mass flow measurement (Coriolis)
- Salt/sulfur monitoring for crude oil

## Extending Profiles

The modular design allows easy extension:
- Add new meter types by creating additional profiles (e.g., UltrasonicGasMeter, VortexMeter)
- Extend existing profiles with manufacturer-specific properties
- Create specialized versions for specific applications
- Reference new profiles from MeterRun via `hasMeterConfiguration`

See [`extending_profiles.md`](extending_profiles.md) for detailed guidance.

## Documentation Structure

- **profile_overview.md** (this file): High-level overview of all profiles
- **[orifice_gas_meter_overview.md](orifice_gas_meter_overview.md)**: Detailed OrificeGasMeter documentation
- **[liquid_meter_overview.md](liquid_meter_overview.md)**: Detailed LiquidMeter documentation
- **[architecture.md](architecture.md)**: System architecture and hierarchy
- **[extending_profiles.md](extending_profiles.md)**: Guide for adding new profiles
- **[vendor_neutral_approach.md](vendor_neutral_approach.md)**: Implementation strategy

## Related Resources

- [CESMII Smart Manufacturing Profiles](https://www.cesmii.org/sm-profiles/)
- [AGA-3 Standard for Orifice Metering](https://www.aga.org/)
- [API MPMS Chapter 11.1 - Volume Correction Factors](https://www.api.org/)
- [ISO 91-1 Petroleum Measurement Systems](https://www.iso.org/)
