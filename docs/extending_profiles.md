# Extending Flow Meter Profiles

## Adding New Meter Types

The current profiles cover orifice gas meters and general liquid meters. Additional specialized profiles can be added for:

**Gas Meters:**
- Ultrasonic gas meters
- Coriolis gas meters
- Rotary meters
- Vortex meters

**Liquid Meters:**
- Specialized turbine meters (with advanced diagnostics)
- Ultrasonic liquid meters (multi-path)
- Specialized PD meters
- Specialized Coriolis meters (with extended properties)

### Using the Generator

```bash
cd tools
python generate_profile.py
```

Follow prompts to create a new profile skeleton.

### Manual Extension

1. Copy `profiles/orifice_gas_meter.jsonld` as template
2. Update `@id` and `rdfs:label`
3. Modify properties for meter type
4. Add/remove meter-specific properties
5. Validate with `python tools/validate_profile.py`

## Common Gas Meter Properties

### Flow Measurement
- **FlowRate**: Current volumetric flow (m³/hr)
- **MassFlowRate**: Mass flow rate (kg/hr) - for Coriolis
- **AccumulatedVolume**: Total volume (m³)

### Pressure/Temperature
- **StaticPressure**: Line pressure (kPa)
- **DifferentialPressure**: Pressure drop (kPa) - orifice/venturi
- **Temperature**: Gas temperature (°C)

### Gas Properties
- **SpecificGravity**: Relative to air
- **HeatingValue**: Energy content (MJ/m³)
- **Density**: Gas density (kg/m³)

### Meter Configuration
- **OrificeDiameter**: Plate bore (mm) - orifice only
- **PipeDiameter**: Meter tube ID (mm)
- **MeterFactor**: K-factor - turbine meters
- **ZeroCutoff**: Low flow cutoff threshold

### Energy/Performance
- **EnergyFlowRate**: Current energy flow (GJ/hr)
- **AccumulatedEnergy**: Total energy (GJ)
- **Uncertainty**: Measurement uncertainty (%)

## Meter Type Specific

### Orifice (Current Profile)
- DifferentialPressure
- OrificeDiameter  
- Beta ratio

### Turbine
- Frequency/RPM
- Meter factor (K-factor)
- Viscosity correction

### Ultrasonic
- Sound velocity
- Path velocities
- Signal strength per path
- Profile factor

### Coriolis
- Mass flow rate
- Density
- Drive gain
- Tube frequency

## Alarms

Standard alarms across meter types:
- High/Low Flow
- High/Low Pressure
- High/Low Temperature
- Communications Fault
- Configuration Error

Add meter-specific alarms as needed.

## Next Steps

1. **Validate existing profile**: Run validator on orifice meter profile
2. **Test with real data**: Map Ignition tags to profile properties
3. **Add meter types**: Extend for turbine/ultrasonic as needed
4. **Integration**: Build Ignition UDT matching this structure
