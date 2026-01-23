# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- FlowComputer profile (v0.1.0) with 28 device properties
- MeterRun profile (v0.1.0) with 8 run properties  
- OrificeGasMeter profile (v0.2.0) with 69 properties including full AGA-3/AGA-8 support
- Profile validation tool
- Profile generator tool
- JSON to SM Profile converter
- Complete documentation suite
- Example instances with realistic data
- MIT License

### Changed
- Restructured from individual meter profiles to hierarchical FlowComputer → MeterRun → Meter architecture
- Adopted GitHub-based namespace (`jpi:`) for vendor-neutral profiles

## [0.1.0] - 2025-01-23

### Initial Release
- Established repository structure
- Created core profile definitions
- Added Python tooling for validation and generation
- Comprehensive documentation for public consumption
