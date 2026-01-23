# JSON to SM Profile Mapping

This document maps the original orifice meter JSON configuration to the CESMII SM Profile properties.

## Configuration Root → Equipment Properties

| JSON Path | SM Profile Property | Notes |
|-----------|---------------------|-------|
| `configuration.name` | `Name` | Direct mapping |
| `configuration.owner` | `Owner` | Direct mapping |
| `configuration.latitude` | `Latitude` | Direct mapping |
| `configuration.longitude` | `Longitude` | Direct mapping |
| `configuration.elevation` | `Elevation` | Direct mapping |

## Base Conditions

| JSON Path | SM Profile Property | Notes |
|-----------|---------------------|-------|
| `configuration.baseTemperature` | `BaseTemperature` | Direct mapping |
| `configuration.basePressure` | `BasePressure` | Direct mapping |
| `configuration.atmosphericPressure` | `AtmosphericPressure` | Direct mapping |
| `configuration.units` | `Units` | Direct mapping (metric/imperial) |
| `configuration.contractHour` | `ContractHour` | Direct mapping |

## AGA-3 Configuration

| JSON Path | SM Profile Property | Notes |
|-----------|---------------------|-------|
| `configuration.AGA3.calculation` | `AGA3_Calculation` | Maps to enum value |
| `configuration.AGA3.orificeTap` | `OrificeTapType` | Maps to enum value |
| `configuration.AGA3.orificeDiameter` | `OrificeDiameter` | Direct mapping (mm) |
| `configuration.AGA3.orificeMaterial` | `OrificeMaterial` | Maps to enum value |
| `configuration.AGA3.orificeReferenceTemperature` | `OrificeReferenceTemperature` | Direct mapping (°C) |
| `configuration.AGA3.pipeInsideDiameter` | `PipeInsideDiameter` | Direct mapping (mm) |
| `configuration.AGA3.pipeMaterial` | `PipeMaterial` | Maps to enum value |
| `configuration.AGA3.pipeReferenceTemperature` | `PipeReferenceTemperature` | Direct mapping (°C) |
| `configuration.AGA3.isentropicExponent` | `IsentropicExponent` | Direct mapping |
| `configuration.AGA3.viscosity` | `Viscosity` | Direct mapping (cP) |
| `configuration.AGA3.flowExtentsion` | `FlowExtension` | Maps to enum value (note: typo in original) |

## AGA-8 Gas Composition

| JSON Path | SM Profile Property | Notes |
|-----------|---------------------|-------|
| `configuration.AGA8.units` | `AGA8_Units` | Maps to enum value |
| `configuration.AGA8.components[].value` (H2) | `GasComp_H2` | Component lookup by name |
| `configuration.AGA8.components[].value` (He) | `GasComp_He` | Component lookup by name |
| `configuration.AGA8.components[].value` (CO2) | `GasComp_CO2` | Component lookup by name |
| `configuration.AGA8.components[].value` (H2S) | `GasComp_H2S` | Component lookup by name |
| `configuration.AGA8.components[].value` (C1) | `GasComp_C1` | Component lookup by name |
| `configuration.AGA8.components[].value` (C2) | `GasComp_C2` | Component lookup by name |
| `configuration.AGA8.components[].value` (C3) | `GasComp_C3` | Component lookup by name |
| `configuration.AGA8.components[].value` (iC4) | `GasComp_iC4` | Component lookup by name |
| `configuration.AGA8.components[].value` (nC4) | `GasComp_nC4` | Component lookup by name |
| `configuration.AGA8.components[].value` (iC5) | `GasComp_iC5` | Component lookup by name |
| `configuration.AGA8.components[].value` (nC5) | `GasComp_nC5` | Component lookup by name |
| `configuration.AGA8.components[].value` (C6) | `GasComp_C6` | Component lookup by name |
| `configuration.AGA8.components[].value` (C7) | `GasComp_C7` | Component lookup by name |
| `configuration.AGA8.components[].value` (C8) | `GasComp_C8` | Component lookup by name |
| `configuration.AGA8.components[].value` (C9) | `GasComp_C9` | Component lookup by name |
| `configuration.AGA8.components[].value` (C10) | `GasComp_C10` | Component lookup by name |
| `configuration.AGA8.components[].value` (N2) | `GasComp_N2` | Component lookup by name |
| `configuration.AGA8.components[].value` (H2O) | `GasComp_H2O` | Component lookup by name |
| `configuration.AGA8.components[].value` (CO) | `GasComp_CO` | Component lookup by name |
| `configuration.AGA8.components[].value` (O2) | `GasComp_O2` | Component lookup by name |
| `configuration.AGA8.components[].value` (Ar) | `GasComp_Ar` | Component lookup by name |
| `configuration.AGA8.density` | `GasDensity` | Direct mapping (kg/m³) |
| `configuration.AGA8.compressibility` | `Compressibility` | Direct mapping (Z-factor) |

## Sensor Configuration - Differential Pressure

| JSON Path | SM Profile Property | Notes |
|-----------|---------------------|-------|
| `configuration.sensors.differentialPressure.source` | `DPSensor_Source` | Direct mapping |
| `configuration.sensors.differentialPressure.serialNumber` | `DPSensor_SerialNumber` | Direct mapping |
| `configuration.sensors.differentialPressure.minimumRange` | `DPSensor_MinRange` | Direct mapping (kPa) |
| `configuration.sensors.differentialPressure.maximumRange` | `DPSensor_MaxRange` | Direct mapping (kPa) |

## Sensor Configuration - Static Pressure

| JSON Path | SM Profile Property | Notes |
|-----------|---------------------|-------|
| `configuration.sensors.staticPressure.source` | `StaticPressureSensor_Source` | Direct mapping |
| `configuration.sensors.staticPressure.serialNumber` | `StaticPressureSensor_SerialNumber` | Direct mapping |
| `configuration.sensors.staticPressure.minimumRange` | `StaticPressureSensor_MinRange` | Direct mapping (kPa) |
| `configuration.sensors.staticPressure.maximumRange` | `StaticPressureSensor_MaxRange` | Direct mapping (kPa) |
| `configuration.sensors.staticPressure.tapLocation` | `StaticPressureSensor_TapLocation` | Maps to enum (upstream/downstream) |
| `configuration.sensors.staticPressure.sensorType` | `StaticPressureSensor_Type` | Maps to enum (gauge/absolute) |

## Sensor Configuration - Temperature

| JSON Path | SM Profile Property | Notes |
|-----------|---------------------|-------|
| `configuration.sensors.flowingTemperature.source` | `TempSensor_Source` | Direct mapping |
| `configuration.sensors.flowingTemperature.serialNumber` | `TempSensor_SerialNumber` | Direct mapping |
| `configuration.sensors.flowingTemperature.minimumRange` | `TempSensor_MinRange` | Direct mapping (°C) |
| `configuration.sensors.flowingTemperature.maximumRange` | `TempSensor_MaxRange` | Direct mapping (°C) |

## Runtime Measurements (Not in original JSON)

These would come from SCADA real-time data:

| SCADA Tag | SM Profile Property | Notes |
|-----------|---------------------|-------|
| `{meter}.FlowRate` | `FlowRate` | m³/hr |
| `{meter}.DiffPress` | `DifferentialPressure` | kPa |
| `{meter}.StaticPress` | `StaticPressure` | kPa |
| `{meter}.Temp` | `Temperature` | °C |
| `{meter}.SpecGrav` | `SpecificGravity` | Unitless |
| `{meter}.EnergyRate` | `EnergyFlowRate` | GJ/hr |
| `{meter}.VolumeAccum` | `AccumulatedVolume` | m³ |
| `{meter}.EnergyAccum` | `AccumulatedEnergy` | GJ |
| `{meter}.HeatingValue` | `HeatingValue` | MJ/m³ |
| `{meter}.Status` | `Status` | Normal/Alarm/Fault/Offline |

## Conversion Notes

### Units Handling
- Original JSON includes `units` field in sensor configs
- SM Profile uses standardized QUDT units in property definitions
- Convert as needed: kPa (original) → unit:KiloPA (profile)

### Enum Mapping
Original JSON uses snake_case or PascalCase, SM Profile maintains consistency:
- `Type_316_Stainless_Steel` → same in profile
- `Flange` → same in profile
- `upstream` → lowercase in profile

### Gas Components
Original JSON uses array with component name lookup. SM Profile flattens to individual properties for direct access and semantic clarity.

### Missing in Original JSON
SM Profile adds:
- `SpecificGravity` (calculated from composition)
- `HeatingValue` (from gas analysis)
- Alarm definitions
- Status enumeration

## Python Conversion Helper

Want a script to convert your JSON config to SM Profile format? Let me know!
