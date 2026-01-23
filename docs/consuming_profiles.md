# Using SM Profiles from GitHub

## Namespace

All profiles use the namespace:
```
https://github.com/JPISolutions/SMProfiles/profiles/v1#
```

This namespace is abbreviated as `jpi` in the JSON-LD `@context`.

## Consuming Profiles

### Direct JSON Reference

Reference profiles directly in your JSON payloads:

```json
{
  "@context": "https://raw.githubusercontent.com/JPISolutions/SMProfiles/main/profiles/flow_computer.jsonld",
  "@type": "jpi:FlowComputer",
  "DeviceName": "BATTERY-12-FC",
  ...
}
```

### MQTT Payloads

Structure your MQTT payloads following the profile schema:

```json
{
  "@type": "jpi:FlowComputer",
  "DeviceName": "BATTERY-12-FLOBOSS",
  "Manufacturer": "Emerson",
  "Model": "ROC809",
  "SerialNumber": "ROC809-2024-A142",
  "NumberOfRuns": 3,
  "hasRun": [
    {
      "@type": "jpi:MeterRun",
      "RunNumber": 1,
      "RunName": "WELL-042-SALES",
      "MeterType": "Orifice",
      "hasMeterConfiguration": {
        "@type": "jpi:OrificeGasMeter",
        "FlowRate": 245.6,
        "DifferentialPressure": 12.4,
        ...
      }
    }
  ]
}
```

### Python Validation

```python
import json
import jsonschema
import requests

# Load profile
profile_url = "https://raw.githubusercontent.com/JPISolutions/SMProfiles/main/profiles/flow_computer.jsonld"
profile = requests.get(profile_url).json()

# Validate your data
with open('my_flow_computer_data.json') as f:
    data = json.load(f)
    
# Basic structure validation
assert data['@type'] == 'jpi:FlowComputer'
assert 'DeviceName' in data
```

### Semantic Querying with RDF

```python
from rdflib import Graph

# Load profile as RDF
g = Graph()
g.parse('https://raw.githubusercontent.com/JPISolutions/SMProfiles/main/profiles/flow_computer.jsonld', format='json-ld')

# Query with SPARQL
query = """
SELECT ?property ?label
WHERE {
    ?property a sm:Property .
    ?property rdfs:label ?label .
}
"""
results = g.query(query)
```

## For Sparkplug B

When using Sparkplug B, map profile properties to Sparkplug metrics:

```python
# FlowComputer properties → Sparkplug metrics
sparkplug_payload = {
    "timestamp": int(time.time() * 1000),
    "metrics": [
        {"name": "Device/DeviceName", "value": "BATTERY-12-FC", "type": "String"},
        {"name": "Device/Model", "value": "ROC809", "type": "String"},
        {"name": "Device/Status", "value": "Normal", "type": "String"},
        {"name": "Run1/FlowRate", "value": 245.6, "type": "Float"},
        {"name": "Run1/StaticPressure", "value": 3450.2, "type": "Float"},
        ...
    ]
}
```

## Versioning

Profiles use semantic versioning (v1, v2, etc.). Breaking changes increment the major version.

Current version: **v1**

When referencing profiles, use the version-specific namespace:
- v1: `https://github.com/JPISolutions/SMProfiles/profiles/v1#`
- Future v2: `https://github.com/JPISolutions/SMProfiles/profiles/v2#`

## Profile Registry

If this repository becomes public, add it to your organization's profile registry:

```json
{
  "registry": "jpi-sm-profiles",
  "profiles": [
    {
      "name": "FlowComputer",
      "version": "0.1.0",
      "url": "https://github.com/JPISolutions/SMProfiles/profiles/flow_computer.jsonld"
    },
    {
      "name": "MeterRun",
      "version": "0.1.0",
      "url": "https://github.com/JPISolutions/SMProfiles/profiles/meter_run.jsonld"
    },
    {
      "name": "OrificeGasMeter",
      "version": "0.2.0",
      "url": "https://github.com/JPISolutions/SMProfiles/profiles/orifice_gas_meter.jsonld"
    }
  ]
}
```

## Contributing

When extending profiles or adding new meter types:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/turbine-meter`)
3. Add new profile following existing patterns
4. Update documentation
5. Submit pull request

## License

MIT License - see LICENSE file for details
