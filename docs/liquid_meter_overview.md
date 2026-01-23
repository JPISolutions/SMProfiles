# Liquid Meter SM Profile

## Overview

Vendor-neutral CESMII SM Profile for liquid meters including turbine, positive displacement, Coriolis, ultrasonic, and magnetic flow meters. Works with crude oil, condensate, water, NGLs, refined products, and mixed liquid streams. This profile includes meter configuration, fluid properties, sensor metadata, and real-time measurements.

## Profile Structure

### Equipment Identification (6 properties)
- **Name**: Meter identifier
- **Owner**: Owner/operator name
- **MeterType**: Turbine/Positive_Displacement/Coriolis/Ultrasonic/Magnetic
- **FluidType**: Crude_Oil/Condensate/Water/Natural_Gas_Liquids/Refined_Products/Mixed_Liquids
- **Latitude/Longitude**: GPS coordinates
- **Elevation**: Elevation above sea level

### Base Conditions (4 properties)
- **BaseTemperature**: Reference temp for volume correction (typically 15°C or 60°F)
- **BasePressure**: Reference pressure (typically 101.325 kPa)
- **Units**: metric/imperial
- **ContractHour**: Daily rollover hour (0-23)

### Calibration & Correction (5 properties)
- **MeterFactor**: Calibration factor applied to raw meter reading
- **KFactor**: Pulses per unit volume (turbine meters)
- **VolumeCorrection**: API_MPMS_11.1 / API_2540 / ISO_91-1 / None
- **ThermalExpansionCoeff**: Coefficient for volume correction (per °C)
- **PipeDiameter**: Internal diameter of meter tube (mm)

### Fluid Properties (9 properties)
- **Density_Reference**: Liquid density at reference conditions (kg/m³)
- **Density_Flowing**: Current density at flowing conditions (kg/m³)
- **API_Gravity**: API gravity at 60°F (crude/condensate)
- **Viscosity**: Dynamic viscosity at flowing conditions (cP)
- **WaterCut**: Percentage of water in liquid stream (%)
- **BSW**: Basic sediment and water content (%)
- **SaltContent**: Salt concentration in crude oil (mg/L)
- **SulfurContent**: Sulfur content in crude oil (%)
- **CTL**: Correction for effect of temperature on liquid
- **CPL**: Correction for effect of pressure on liquid

### Sensor Configuration (9 properties)

**Pressure Sensor:**
- Source, SerialNumber, MinRange, MaxRange

**Temperature Sensor:**
- Source, SerialNumber, MinRange, MaxRange

**Density Sensor (if equipped):**
- Source, SerialNumber

### Runtime Measurements (8 properties)
- **FlowRate_Volumetric**: Volumetric flow at flowing conditions (m³/hr)
- **FlowRate_Mass**: Mass flow rate (kg/hr)
- **Pressure**: Line pressure (kPa)
- **Temperature**: Liquid temperature (°C)
- **AccumulatedVolume_Gross**: Total volume at flowing conditions (m³)
- **AccumulatedVolume_Net**: Total volume corrected to reference conditions (m³)
- **AccumulatedMass**: Total accumulated mass (kg)
- **Status**: Normal/Alarm/Fault/Offline/Maintenance

### Alarms (12 types)
- High/Low Flow Rate
- No Flow
- High/Low Pressure
- High/Low Temperature
- High Water Cut
- Meter Factor Out of Range
- Communications Fault
- Sensor Fault
- Calibration Due

## Total Properties: 53

**Configuration (static)**: 35 properties  
**Runtime (dynamic)**: 8 properties  
**Alarms**: 12 types

## Usage Notes

### Meter Types

**Turbine Meters:**
- Use K-Factor property
- Monitor for bearing wear affecting MeterFactor
- Best for clean, low-viscosity liquids
- Accuracy typically ±0.25% to ±0.5%

**Positive Displacement (PD) Meters:**
- Use MeterFactor property
- Excellent for high-viscosity fluids
- Less affected by flow profile
- Accuracy typically ±0.1% to ±0.2%

**Coriolis Meters:**
- Measure mass flow directly
- Provide density measurement
- Most accurate but expensive
- Accuracy typically ±0.1% to ±0.15%

**Ultrasonic Meters:**
- Non-intrusive, no pressure drop
- Multi-path for accuracy
- Good for large diameter pipes
- Accuracy typically ±0.5% to ±1%

**Magnetic (Mag) Meters:**
- Only for conductive liquids (water)
- No moving parts
- No pressure drop
- Accuracy typically ±0.5%

### Volume Correction Standards

**API MPMS 11.1:**
- Standard for crude oil and refined products
- Corrects for temperature and pressure effects
- Uses CTL and CPL factors
- Most common in North America

**API 2540:**
- Legacy standard for petroleum measurement
- Largely replaced by MPMS 11.1

**ISO 91-1:**
- International standard for petroleum measurement
- Similar to API but metric-based

### Fluid Properties

**API Gravity:**
- Crude oil classification: Light (>31.1°), Medium (22.3-31.1°), Heavy (<22.3°)
- Affects density calculations and volume corrections
- Measured at 60°F

**Water Cut:**
- Critical for custody transfer
- High water cut affects meter accuracy
- Requires BS&W sampling for verification

**Viscosity:**
- Affects meter factor (especially turbine meters)
- Temperature-dependent
- Important for high-viscosity crude

### Static vs Dynamic Properties
- **Static properties** (meter type, calibration, fluid properties) change infrequently
- **Dynamic properties** (flow rates, totals, status) update continuously
- In Ignition UDTs, consider separating static config from dynamic tags

### Gross vs Net Volume
- **Gross Volume**: Measured at flowing conditions (actual volume through meter)
- **Net Volume**: Corrected to standard conditions (15°C, 101.325 kPa)
- Net volume used for custody transfer and billing

### CTL/CPL Factors
- **CTL**: Correction for Temperature on Liquid (typically 0.0001 to 0.001 per °C)
- **CPL**: Correction for Pressure on Liquid (typically negligible for liquids)
- Applied to convert gross to net volume

## Mapping to Ignition

### Suggested UDT Structure
```
LiquidMeterConfig/ (folder)
  ├─ Identification/
  │   ├─ Name
  │   ├─ MeterType
  │   └─ FluidType
  ├─ BaseConditions/
  ├─ Calibration/
  ├─ FluidProperties/
  └─ Sensors/
     ├─ Pressure_Sensor/
     ├─ Temp_Sensor/
     └─ Density_Sensor/

LiquidMeterRuntime/ (folder)
  ├─ FlowRates/
  ├─ Accumulations/
  └─ Status/
```

### Tag Organization
- Use **Memory tags** for static config (refreshed on startup)
- Use **OPC tags** for runtime measurements and totalizers
- Use **Expression tags** for calculated values (CTL, CPL, net volume)
- Use **Derived tags** for daily/hourly rollup calculations

## Comparison with Gas Meters

### Differences from Orifice Gas Meter Profile

**Liquid meters do NOT have:**
- Differential pressure (except for orifice-type liquid meters)
- Gas composition (AGA-8)
- Compressibility factor (liquids are incompressible)
- Isentropic exponent
- Energy measurements (BTU/hour, GJ)

**Liquid meters DO have:**
- Water cut and BS&W
- API gravity
- Mass flow measurement
- Simpler volume corrections (no compression calcs)
- Salt and sulfur content (for crude)

**Commonalities:**
- Both need temperature/pressure correction
- Both have sensor calibration metadata
- Both support multiple units systems
- Both have contract hour for daily rollover
- Similar alarm structures

## Field Application Notes

### Custody Transfer
- Requires periodic meter proving (compare to prover volume)
- Maintain calibration records and meter factors
- Monitor for drift in meter factor over time
- Water cut analysis required for BS&W corrections

### Maintenance Indicators
- **Meter Factor Drift**: Indicates wear or fouling
- **High Water Cut**: May affect accuracy, requires BS&W testing
- **Viscosity Changes**: Can affect turbine meter performance
- **Density Variations**: Monitor for product changes or contamination

### Alberta Oil & Gas Considerations
- Directive 017 compliance requires accurate liquid measurement
- Battery condensate metering critical for royalty calculations
- Water disposal volume tracking for regulatory reporting
- Salt content monitoring for pipeline specifications

## Extending Profile

For specific meter implementations, you can add:
- **Turbine-specific**: Bearing temperature, rotor frequency
- **Coriolis-specific**: Drive gain, tube oscillation frequency
- **PD-specific**: Rotation count, slip compensation
- **Ultrasonic-specific**: Path velocities, sound velocity

See `extending_profiles.md` for details on creating specialized profiles.
