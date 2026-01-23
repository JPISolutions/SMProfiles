# Orifice Gas Meter SM Profile - Vendor Neutral

## What Changed

The profile has been made **vendor-neutral** to serve as a standard data model that works across different flow computer implementations.

### Naming Changes
- **Profile Name**: `RealfloOrificeMeter` → `OrificeGasMeter`
- **File Name**: `realflo_orifice_meter.jsonld` → `orifice_gas_meter.jsonld`
- **Label**: "Realflo Orifice Gas Meter" → "Orifice Gas Meter"

### Updated Description
The profile now explicitly states it's applicable to:
- **FloBoss** (Emerson)
- **TotalFlow** (ABB)
- **SCADA pack** implementations
- **Custom flow computers**
- Any other AGA-3/AGA-8 compliant orifice meter system

## Why This Matters

### Standard Data Model
This profile defines a **semantic standard** that different vendor implementations can map to. Whether you're running FloBoss, TotalFlow, or a custom SCADA pack, they all export data that conforms to this same structure.

### Vendor Interoperability
Your Ignition SCADA, dashboards, or analytics don't care if the meter is FloBoss or TotalFlow - they all speak the same "language" defined by this profile.

### Example Mapping

**FloBoss ROC800** → Maps to OrificeGasMeter profile
- FloBoss "Flow Rate" tag → `OrificeGasMeter/FlowRate`
- FloBoss "DP" tag → `OrificeGasMeter/DifferentialPressure`
- FloBoss "Static" tag → `OrificeGasMeter/StaticPressure`

**TotalFlow G5** → Maps to same OrificeGasMeter profile
- TotalFlow "Flow" → `OrificeGasMeter/FlowRate`
- TotalFlow "Diff Press" → `OrificeGasMeter/DifferentialPressure`
- TotalFlow "Line Press" → `OrificeGasMeter/StaticPressure`

**Custom SCADA Pack** → Maps to same OrificeGasMeter profile
- Your custom tags map the same way

## What Stays the Same

All 69 properties remain identical:
- AGA-3 configuration
- AGA-8 gas composition
- Sensor specifications
- Runtime measurements
- Alarm definitions

The profile structure is unchanged - only the naming is now vendor-agnostic.

## Usage

When implementing:
1. Use this profile as your **canonical data model**
2. Build vendor-specific **adapters/mappings** from FloBoss/TotalFlow/etc to this model
3. All upstream systems (HMI, analytics, reporting) use **only** this standard model
4. Swap out field equipment without changing your SCADA/analytics layer

This is the whole point of CESMII SM Profiles - vendor-neutral semantic standards for industrial equipment.
