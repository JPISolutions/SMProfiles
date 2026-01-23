# Contributing to SM Profiles

Thank you for your interest in contributing to the Gas Flow Computer SM Profiles! This guide will help you get started.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`

```bash
git checkout -b feature/your-feature-name
```

## Adding a New Meter Type Profile

### 1. Use the Profile Generator

```bash
cd tools
python generate_profile.py
```

Follow the prompts to create a skeleton profile.

### 2. Follow Naming Conventions

- Profile ID: `jpi:MeterTypeName` (e.g., `jpi:TurbineMeter`)
- File name: `meter_type_name.jsonld` (lowercase, underscores)
- Properties: `jpi:MeterTypeName/PropertyName`

### 3. Include Required Sections

All meter profiles should include:
- Measurement properties (flow, accumulations)
- Configuration properties (specific to meter type)
- Status property
- Standard alarms (comms fault, sensor errors, etc.)

### 4. Validate Your Profile

```bash
python validate_profile.py ../profiles/your_new_profile.jsonld
```

### 5. Create Example Instance

Add an example in `examples/` showing realistic data.

### 6. Update Documentation

- Add profile to main README.md
- Update `docs/extending_profiles.md` with meter-specific details
- Include property breakdown in `docs/profile_overview.md`

## Code Style

### JSON-LD Formatting
- 2-space indentation
- Properties alphabetically ordered where logical
- Comments clear and concise
- Units always specified for numeric values

### Python Scripts
- Follow PEP 8
- Include docstrings
- Add logging for debugging
- Handle errors gracefully

## Pull Request Process

1. **Update version numbers** if applicable
2. **Run validation** on all modified profiles
3. **Update CHANGELOG.md** (if exists)
4. **Write clear commit messages**:
   ```
   Add TurbineMeter profile
   
   - 45 properties covering turbine meter config
   - K-factor, frequency, and viscosity correction
   - Compatible with Instromet and Daniel turbine meters
   ```

5. **Submit PR** with description of changes

## Profile Versioning

We use semantic versioning for profiles:
- **Major** (v1 → v2): Breaking changes to property names/structure
- **Minor** (v0.1 → v0.2): New properties added (backward compatible)
- **Patch** (v0.1.0 → v0.1.1): Bug fixes, documentation

## Questions?

Open an issue on GitHub or contact the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
