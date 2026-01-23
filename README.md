# Gas Meter SM Profiles

CESMII Smart Manufacturing profiles for gas metering equipment following AGA-3 and AGA-8 standards.

## Current Profiles

### Orifice Gas Meter (v0.2.0)
**Location**: `profiles/orifice_gas_meter.jsonld`

Vendor-neutral profile for orifice gas flow meters (FloBoss, TotalFlow, SCADA packs, etc.) with **69 total properties**:

- **Equipment ID**: Name, owner, GPS coordinates, elevation
- **Base Conditions**: Base temp/pressure, atmospheric pressure, contract hour
- **AGA-3 Config**: Calculation method, orifice/pipe specs, materials, tap types, viscosity, isentropic exponent
- **AGA-8 Gas Composition**: All 21 components (H2, He, CO2, H2S, C1-C10, N2, H2O, CO, O2, Ar)
- **Sensor Specs**: Full metadata for DP, static pressure, and temperature sensors (ranges, serials, tap locations)
- **Runtime Measurements**: Flow, energy, pressures, temperature, accumulations, status
- **8 Standard Alarms**: Hi/Lo pressure/temp, comms fault, sensor out of range

See `docs/profile_overview.md` for complete property breakdown.

## Structure

```
SMProfiles/
├── profiles/          # SM Profile definitions (JSON-LD)
├── schemas/           # Validation schemas
├── tools/             # Python utilities
│   ├── setup.bat     # Windows environment setup
│   ├── validate_profile.py
│   └── generate_profile.py
├── examples/          # Usage examples with real data
└── docs/              # Documentation
```

## Quick Start

**1. Setup Python environment:**
```bash
cd tools
setup.bat
venv\Scripts\activate.bat
```

**2. Validate the profile:**
```bash
python validate_profile.py ..\profiles\orifice_gas_meter.jsonld
```

**3. View example instance:**
```bash
type ..\examples\meter_instance.jsonld
```

## What's Included

### AGA-3 Compliance
- Support for 1985, 1992, and 2013 calculation standards
- Flange, pipe, and corner tap configurations
- Material thermal expansion (SS304, SS316, Monel, Carbon Steel)
- Flow extension methods

### AGA-8 Gas Composition
Full 21-component gas analysis with molar fractions:
- Light gases (H2, He, N2, CO2, etc.)
- C1 (methane) through C10 (decane)
- Iso/normal butanes and pentanes
- Calculated density and compressibility

### Sensor Metadata
Complete instrumentation specs for custody transfer compliance:
- Differential pressure transmitter ranges
- Static pressure configuration (gauge/absolute, upstream/downstream)
- Temperature sensor calibration ranges
- Serial numbers for traceability

### Runtime Values
Real-time measurements with timestamps:
- Volumetric and energy flow rates
- Process conditions (DP, static pressure, temperature)
- Gas properties (specific gravity, heating value, compressibility)
- Accumulations (volume and energy)

## Usage

### For SCADA Integration
Map this profile to your Ignition UDT structure. Separate static config (AGA params, sensor specs) from dynamic tags (measurements, status).

### For System Interoperability
Use this profile as a standard interface for meter data exchange between systems, ensuring consistent semantics across platforms.

### For New Meter Types
Use `generate_profile.py` to create profiles for turbine, ultrasonic, or coriolis meters based on this structure.

## Documentation

- **`docs/profile_overview.md`**: Complete property breakdown with usage notes
- **`docs/extending_profiles.md`**: Guide for adding new meter types
- **`examples/meter_instance.jsonld`**: Full instance example with realistic data

## Tools

### validate_profile.py
Validates SM Profiles for:
- JSON-LD syntax correctness
- Required field presence
- Property structure compliance
- Unit consistency
- Generates detailed validation reports

### generate_profile.py
Interactive tool for creating new equipment profiles. Prompts for equipment type, properties, and units, then generates valid SM Profile skeleton.

### convert_json.py
Converts original JSON meter configurations to SM Profile instance format. Automatically maps all properties including AGA-3/AGA-8 params, sensor specs, and gas composition.

```bash
python convert_json.py examples/input/sample_meter_config.json output.jsonld METER-001
```

## Next Steps

1. **Validate** the existing profile
2. **Map** to your Ignition tag structure
3. **Test** with real meter data
4. **Extend** for additional meter types as needed

Built for Alberta oil & gas field operations with Directive 017 compliance in mind.
