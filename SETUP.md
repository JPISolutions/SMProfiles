# Setup Instructions

## First Time Setup

After cloning this repository, follow these steps:

### 1. Setup Python Environment (For Tools)

```bash
cd tools
setup.bat              # Windows
# or
./setup.sh             # Linux/Mac

# Activate virtual environment
venv\Scripts\activate.bat    # Windows
# or
source venv/bin/activate     # Linux/Mac
```

### 2. Validate Profiles

```bash
python validate_profile.py ../profiles/flow_computer.jsonld
python validate_profile.py ../profiles/meter_run.jsonld
python validate_profile.py ../profiles/orifice_gas_meter.jsonld
```

All three should pass validation with no errors.

### 3. Review Examples

Check out `examples/flow_computer_instance.jsonld` to see a complete flow computer with 3 meter runs.

## Repository Structure

```
SMProfiles/
├── profiles/               # Profile definitions
│   ├── flow_computer.jsonld
│   ├── meter_run.jsonld
│   └── orifice_gas_meter.jsonld
├── tools/                  # Python utilities
│   ├── validate_profile.py
│   ├── generate_profile.py
│   └── convert_json.py
├── examples/               # Sample data
├── docs/                   # Documentation
├── CONTRIBUTING.md         # Contribution guidelines
├── LICENSE                 # MIT License
└── README.md              # Main documentation
```

## For Developers

### Adding New Meter Types

1. Use the profile generator:
   ```bash
   cd tools
   python generate_profile.py
   ```

2. Follow the prompts to create your profile skeleton

3. Add meter-specific properties

4. Validate your profile

5. See CONTRIBUTING.md for full guidelines

### Consuming Profiles

See `docs/consuming_profiles.md` for:
- JSON/MQTT payload examples
- Python validation examples
- Sparkplug B mapping
- Semantic querying with RDF

## Troubleshooting

**"Module not found" errors:**
- Make sure you've activated the virtual environment
- Run `pip install -r requirements.txt` in the tools directory

**Validation fails:**
- Check JSON syntax (trailing commas, quotes)
- Verify all @id fields use correct namespace prefix (`jpi:`)
- Ensure all properties have required fields (@id, @type, rdfs:label)

## Next Steps

1. Review `docs/architecture.md` to understand the profile hierarchy
2. Check `docs/profile_overview.md` for property details
3. See `docs/extending_profiles.md` to add new meter types
4. Read CONTRIBUTING.md before making changes

## Questions?

Open an issue on GitHub or consult the documentation in the `docs/` directory.
