# Orifice Gas Meter SM Profile

## Overview

Vendor-neutral CESMII SM Profile for AGA-3/AGA-8 compliant orifice gas meters. Works with FloBoss, TotalFlow, SCADA packs, and other flow computer implementations. This profile includes full configuration, gas composition, sensor metadata, and real-time measurements.

## Profile Structure

### Equipment Identification (5 properties)
- **Name**: Meter identifier
- **Owner**: Owner/operator name
- **Latitude/Longitude**: GPS coordinates
- **Elevation**: Elevation above sea level

### Base Conditions (5 properties)
- **BaseTemperature**: Reference temp for volume correction (typically 15°C)
- **BasePressure**: Reference pressure (typically 101.325 kPa)
- **AtmosphericPressure**: Local atmospheric pressure
- **Units**: metric/imperial
- **ContractHour**: Daily rollover hour (0-23)

### AGA-3 Configuration (11 properties)
- **AGA3_Calculation**: Standard version (1985/1992/2013)
- **OrificeTapType**: Flange/Pipe/Corner
- **OrificeDiameter**: Plate bore diameter (mm)
- **OrificeMaterial**: SS304/SS316/Monel/Carbon Steel
- **OrificeReferenceTemperature**: Diameter measurement temp
- **PipeInsideDiameter**: Meter tube ID (mm)
- **PipeMaterial**: Tube material
- **PipeReferenceTemperature**: Diameter measurement temp
- **IsentropicExponent**: k-value (typically 1.3 for natural gas)
- **Viscosity**: Gas dynamic viscosity (cP)
- **FlowExtension**: Method_1/Method_2

### AGA-8 Gas Composition (23 properties)
- **AGA8_Units**: molar_fraction/mole_percent
- **GasComp_[Component]**: 21 individual gas components:
  - Light gases: H2, He, N2, O2, Ar, CO, CO2, H2S, H2O
  - Hydrocarbons: C1 (methane) through C10 (decane)
  - Butanes: iC4, nC4
  - Pentanes: iC5, nC5
- **GasDensity**: Calculated gas density (kg/m³)
- **Compressibility**: Z-factor

### Sensor Configuration (15 properties)

**Differential Pressure Sensor:**
- Source, SerialNumber, MinRange, MaxRange

**Static Pressure Sensor:**
- Source, SerialNumber, MinRange, MaxRange
- TapLocation (upstream/downstream)
- Type (gauge/absolute)

**Temperature Sensor:**
- Source, SerialNumber, MinRange, MaxRange

### Runtime Measurements (10 properties)
- **FlowRate**: Volumetric flow (m³/hr)
- **DifferentialPressure**: DP across orifice (kPa)
- **StaticPressure**: Line pressure (kPa)
- **Temperature**: Gas temp (°C)
- **SpecificGravity**: Relative to air
- **EnergyFlowRate**: Energy flow (GJ/hr)
- **AccumulatedVolume**: Total volume (m³)
- **AccumulatedEnergy**: Total energy (GJ)
- **HeatingValue**: Gas heating value (MJ/m³)
- **Status**: Normal/Alarm/Fault/Offline

### Alarms (8 types)
- High/Low Differential Pressure
- High/Low Static Pressure
- High/Low Temperature
- Communications Fault
- Sensor Out of Range

## Total Properties: 69

**Configuration (static)**: 59 properties  
**Runtime (dynamic)**: 10 properties

## Usage Notes

### Static vs Dynamic Properties
- **Static properties** (config, AGA params, sensor specs) change infrequently
- **Dynamic properties** (measurements, status) update continuously
- In Ignition UDTs, consider separating static config from dynamic tags

### Gas Composition
- All 21 AGA-8 components included
- Values must sum to 1.0 (or 100 if using mole_percent)
- Typically C1 (methane) dominates in natural gas (~85-95%)
- Heavier components (C7+) often zero or trace amounts

### Sensor Ranges
- Configure min/max ranges to match installed instrumentation
- Use for alarming when measurements approach limits
- Critical for custody transfer accuracy verification

### Material Enumerations
Materials affect thermal expansion calculations:
- **Orifice**: Type_304_Stainless_Steel, Type_316_Stainless_Steel, Monel, Carbon_Steel
- **Pipe**: Carbon_Steel, Stainless_Steel_304, Stainless_Steel_316

### AGA-3 Versions
- **1985**: Original standard
- **1992**: Iterative calculation improvements  
- **2013**: Current standard with enhanced accuracy

### Pressure Tap Types
- **Flange**: Most common, taps at 1" from plate faces
- **Pipe**: Taps at 2.5D and 8D
- **Corner**: Taps immediately adjacent to plate

## Mapping to Ignition

### Suggested UDT Structure
```
MeterConfig/ (folder)
  ├─ Identification/
  ├─ BaseConditions/
  ├─ AGA3_Config/
  ├─ GasComposition/
  └─ Sensors/
     ├─ DP_Sensor/
     ├─ SP_Sensor/
     └─ Temp_Sensor/

MeterRuntime/ (folder)
  ├─ Measurements/
  └─ Status/
```

### Tag Organization
- Use **Memory tags** for static config (refreshed on startup)
- Use **OPC tags** for runtime measurements
- Use **Expression tags** for calculated values (specific gravity, etc.)

## Extending for Other Meter Types

This profile is specifically for orifice meters. For other types:

**Turbine Meters**: Remove DP, add frequency/RPM, meter factor  
**Ultrasonic Meters**: Remove DP, add path velocities, sound velocity  
**Coriolis Meters**: Add mass flow, density, drive gain  
**Rotary Meters**: Add displacement volume, mechanical index

See `extending_profiles.md` for details on creating new profiles.
