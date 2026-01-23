# Namespace & Registration Strategy

## Current Approach: GitHub-Based Namespace

**Namespace:** `https://github.com/JPISolutions/SMProfiles/profiles/v1#`  
**Prefix:** `jpi`

### Why GitHub?

1. **Immediate Use**: No registration process, works now
2. **Version Control**: Git provides built-in versioning
3. **Public Access**: Can be made public when ready
4. **Flexibility**: Easy to iterate and improve

### How It Works

JSON-LD profiles use URIs as identifiers. By using GitHub as the namespace, you're saying "this profile is defined at this GitHub location."

```json
{
  "@context": {
    "jpi": "https://github.com/JPISolutions/SMProfiles/profiles/v1#"
  },
  "@id": "jpi:FlowComputer",
  "@type": "sm:EquipmentType"
}
```

When someone references `jpi:FlowComputer`, the full URI is:  
`https://github.com/JPISolutions/SMProfiles/profiles/v1#FlowComputer`

## Do You Need NodeSets?

**Short answer: No** (for most oil & gas SCADA applications)

### You DON'T need NodeSets if:
- ✅ Using JSON over MQTT
- ✅ Using REST APIs
- ✅ Ignition reading Modbus/EtherNet/IP from flow computers
- ✅ Storing data in files or databases
- ✅ Using Sparkplug B

### You DO need NodeSets if:
- ❌ Exposing data via OPC UA server
- ❌ Consuming data from OPC UA clients that require type definitions
- ❌ Using OPC UA as the primary transport protocol

**For your use case (JSON via MQTT):** The JSON-LD profiles are sufficient.

## Profile vs Data Instance

**Profile** (what this repo provides):
- Defines the structure and meaning of data
- Like a schema or class definition
- Stored in `profiles/` directory
- Used for validation and documentation

**Instance** (what you send over MQTT):
- Actual data conforming to the profile
- Like an object or record
- Your MQTT payload
- References the profile via `@type`

Example instance:
```json
{
  "@type": "jpi:FlowComputer",
  "DeviceName": "BATTERY-12-FC",
  "Model": "ROC809",
  "Status": "Normal"
}
```

## Registration with CESMII (Future Option)

### When to Consider Registration

Register with CESMII Profile Library (https://profilelibrary.cesmii.net/) if:
- Other companies want to adopt these profiles
- Seeking industry-wide standardization
- Want CESMII's official endorsement
- Profile becomes stable (v1.0+)

### Benefits of Registration
- Official CESMII namespace
- Discoverable by community
- Industry credibility
- Governance and review process

### Drawbacks of Registration
- Approval process takes time
- Less flexibility for changes
- More formal requirements
- Must follow CESMII guidelines

### Hybrid Approach (Recommended)

1. **Start:** Use GitHub namespace (`jpi:`)
2. **Iterate:** Improve profiles based on real-world use
3. **Stabilize:** Reach v1.0 with proven adoption
4. **Register:** Submit to CESMII for official status
5. **Migrate:** Provide both namespaces during transition

```json
{
  "@context": {
    "jpi": "https://github.com/JPISolutions/SMProfiles/profiles/v1#",
    "cesmii": "http://cesmii.org/profiles/jpi/gas-metering/v1/"
  },
  "@id": "jpi:FlowComputer",
  "owl:sameAs": "cesmii:FlowComputer"
}
```

## Versioning Strategy

### Semantic Versioning

- **v1.0.0**: First stable release
- **v1.1.0**: New properties added (backward compatible)
- **v2.0.0**: Breaking changes (property renames, removals)

### Namespace Versioning

```
v1: https://github.com/JPISolutions/SMProfiles/profiles/v1#
v2: https://github.com/JPISolutions/SMProfiles/profiles/v2#
```

Clients specify which version they support:
```json
{
  "@context": "https://github.com/JPISolutions/SMProfiles/profiles/v1#",
  ...
}
```

## Consuming from GitHub

### Direct Reference (Raw URL)

```json
{
  "@context": "https://raw.githubusercontent.com/JPISolutions/SMProfiles/main/profiles/flow_computer.jsonld",
  "@type": "jpi:FlowComputer",
  ...
}
```

### Local Copy

```python
# Download profiles once, use locally
import requests

profile = requests.get(
    'https://raw.githubusercontent.com/JPISolutions/SMProfiles/main/profiles/flow_computer.jsonld'
).json()

# Cache locally
with open('cached_flow_computer_profile.json', 'w') as f:
    json.dump(profile, f)
```

### Git Submodule

```bash
# Add profiles as submodule to your project
git submodule add https://github.com/JPISolutions/SMProfiles.git sm-profiles
```

## Summary

**For now:**
- ✅ Use GitHub-based namespace (`jpi:`)
- ✅ JSON-LD profiles are sufficient (no NodeSets needed)
- ✅ Profiles can be referenced directly from GitHub
- ✅ Keep profiles in current repository

**Later (optional):**
- 🔮 Register with CESMII when profiles are stable and adopted
- 🔮 Generate OPC UA NodeSets if you add OPC UA servers
- 🔮 Consider separate profile repository if it grows large

**The GitHub approach is perfect for your MQTT/JSON use case and can stay this way indefinitely.**
