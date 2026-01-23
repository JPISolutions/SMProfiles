#!/usr/bin/env python3
"""
JSON to SM Profile Instance Converter
Converts orifice meter JSON configuration to CESMII SM Profile instance format.
"""

import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def convert_json_to_sm_profile(json_config: Dict[str, Any], meter_id: str) -> Dict[str, Any]:
    """
    Convert orifice meter JSON to SM Profile instance.
    
    Args:
        json_config: Original JSON configuration
        meter_id: Unique identifier for this meter instance
        
    Returns:
        SM Profile instance as dict
    """
    logger.info(f"Converting meter: {json_config.get('configuration', {}).get('name', 'Unknown')}")
    
    config = json_config.get('configuration', {})
    aga3 = config.get('AGA3', {})
    aga8 = config.get('AGA8', {})
    sensors = config.get('sensors', {})
    
    # Build SM Profile instance
    instance = {
        "@context": {
            "sm": "http://cesmii.org/sm/",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "unit": "http://qudt.org/vocab/unit/"
        },
        "@id": f"sm:OrificeGasMeter/Instance/{meter_id}",
        "@type": "sm:OrificeGasMeter",
        "rdfs:label": config.get('name', 'Unknown Meter'),
        "sm:propertyValues": {}
    }
    
    props = instance["sm:propertyValues"]
    
    # Equipment ID
    _add_prop(props, "Name", config.get('name'))
    _add_prop(props, "Owner", config.get('owner'))
    _add_prop(props, "Latitude", config.get('latitude'), "unit:DEG")
    _add_prop(props, "Longitude", config.get('longitude'), "unit:DEG")
    _add_prop(props, "Elevation", config.get('elevation'), "unit:M")
    
    # Base Conditions
    _add_prop(props, "BaseTemperature", config.get('baseTemperature'), "unit:DEG_C")
    _add_prop(props, "BasePressure", config.get('basePressure'), "unit:KiloPA")
    _add_prop(props, "AtmosphericPressure", config.get('atmosphericPressure'), "unit:KiloPA")
    _add_prop(props, "Units", config.get('units'))
    _add_prop(props, "ContractHour", config.get('contractHour'))
    
    # AGA-3 Config
    _add_prop(props, "AGA3_Calculation", aga3.get('calculation'))
    _add_prop(props, "OrificeTapType", aga3.get('orificeTap'))
    _add_prop(props, "OrificeDiameter", aga3.get('orificeDiameter'), "unit:MilliM")
    _add_prop(props, "OrificeMaterial", aga3.get('orificeMaterial'))
    _add_prop(props, "OrificeReferenceTemperature", aga3.get('orificeReferenceTemperature'), "unit:DEG_C")
    _add_prop(props, "PipeInsideDiameter", aga3.get('pipeInsideDiameter'), "unit:MilliM")
    _add_prop(props, "PipeMaterial", aga3.get('pipeMaterial'))
    _add_prop(props, "PipeReferenceTemperature", aga3.get('pipeReferenceTemperature'), "unit:DEG_C")
    _add_prop(props, "IsentropicExponent", aga3.get('isentropicExponent'), "unit:UNITLESS")
    _add_prop(props, "Viscosity", aga3.get('viscosity'), "unit:CentiPOISE")
    _add_prop(props, "FlowExtension", aga3.get('flowExtentsion'))  # Note: typo in original JSON
    
    # AGA-8 Gas Composition
    _add_prop(props, "AGA8_Units", aga8.get('units'))
    
    # Map gas components
    components = {comp['component']: comp['value'] for comp in aga8.get('components', [])}
    for component_name, value in components.items():
        prop_name = f"GasComp_{component_name}"
        _add_prop(props, prop_name, value, "unit:UNITLESS")
    
    _add_prop(props, "GasDensity", aga8.get('density'), "unit:KiloGM-PER-M3")
    _add_prop(props, "Compressibility", aga8.get('compressibility'), "unit:UNITLESS")
    
    # Differential Pressure Sensor
    dp_sensor = sensors.get('differentialPressure', {})
    _add_prop(props, "DPSensor_Source", dp_sensor.get('source'))
    _add_prop(props, "DPSensor_SerialNumber", dp_sensor.get('serialNumber'))
    _add_prop(props, "DPSensor_MinRange", dp_sensor.get('minimumRange'), "unit:KiloPA")
    _add_prop(props, "DPSensor_MaxRange", dp_sensor.get('maximumRange'), "unit:KiloPA")
    
    # Static Pressure Sensor
    sp_sensor = sensors.get('staticPressure', {})
    _add_prop(props, "StaticPressureSensor_Source", sp_sensor.get('source'))
    _add_prop(props, "StaticPressureSensor_SerialNumber", sp_sensor.get('serialNumber'))
    _add_prop(props, "StaticPressureSensor_MinRange", sp_sensor.get('minimumRange'), "unit:KiloPA")
    _add_prop(props, "StaticPressureSensor_MaxRange", sp_sensor.get('maximumRange'), "unit:KiloPA")
    _add_prop(props, "StaticPressureSensor_TapLocation", sp_sensor.get('tapLocation'))
    _add_prop(props, "StaticPressureSensor_Type", sp_sensor.get('sensorType'))
    
    # Temperature Sensor
    temp_sensor = sensors.get('flowingTemperature', {})
    _add_prop(props, "TempSensor_Source", temp_sensor.get('source'))
    _add_prop(props, "TempSensor_SerialNumber", temp_sensor.get('serialNumber'))
    _add_prop(props, "TempSensor_MinRange", temp_sensor.get('minimumRange'), "unit:DEG_C")
    _add_prop(props, "TempSensor_MaxRange", temp_sensor.get('maximumRange'), "unit:DEG_C")
    
    logger.info(f"Converted {len(props)} properties")
    return instance


def _add_prop(props: Dict, name: str, value: Any, unit: str = None):
    """Add a property to the property values dict."""
    if value is None:
        return
    
    prop = {"value": value}
    if unit:
        prop["unit"] = unit
    
    props[name] = prop


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python convert_json.py <input.json> [output.jsonld] [meter_id]")
        print("\nExample:")
        print("  python convert_json.py config.json meter_instance.jsonld WELL-001")
        sys.exit(1)
    
    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else input_path.with_suffix('.sm.jsonld')
    meter_id = sys.argv[3] if len(sys.argv) > 3 else input_path.stem.upper()
    
    if not input_path.exists():
        logger.error(f"Input file not found: {input_path}")
        sys.exit(1)
    
    # Load input JSON
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            json_config = json.load(f)
    except Exception as e:
        logger.error(f"Failed to read input file: {e}")
        sys.exit(1)
    
    # Convert
    try:
        instance = convert_json_to_sm_profile(json_config, meter_id)
    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        sys.exit(1)
    
    # Write output
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(instance, f, indent=2)
        logger.info(f"Written to: {output_path}")
    except Exception as e:
        logger.error(f"Failed to write output: {e}")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("CONVERSION COMPLETE")
    print("="*60)
    print(f"Input:  {input_path}")
    print(f"Output: {output_path}")
    print(f"Meter:  {meter_id}")
    print("\nValidate with:")
    print(f"  python validate_profile.py {output_path}")


if __name__ == '__main__':
    main()
