#!/usr/bin/env python3
"""
SM Profile Generator
Creates skeleton SM Profile definitions for new equipment types.
"""

import json
import logging
import sys
from pathlib import Path
from typing import Dict, List

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_profile_skeleton(
    equipment_name: str,
    properties: List[Dict[str, str]],
    output_path: Path
) -> None:
    """
    Generate a basic SM Profile skeleton.
    
    Args:
        equipment_name: Name of the equipment type (e.g., "Turbine Meter")
        properties: List of property dicts with 'name', 'dataType', 'unit'
        output_path: Where to save the profile
    """
    logger.info(f"Generating profile for: {equipment_name}")
    
    # Generate ID-safe name
    id_name = equipment_name.replace(' ', '')
    
    profile = {
        "@context": {
            "sm": "http://cesmii.org/sm/",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "unit": "http://qudt.org/vocab/unit/",
            "qudt": "http://qudt.org/schema/qudt/"
        },
        "@id": f"sm:{id_name}",
        "@type": "sm:EquipmentType",
        "rdfs:label": equipment_name,
        "rdfs:comment": f"SM Profile for {equipment_name}",
        "sm:version": "0.1.0",
        "sm:properties": []
    }
    
    # Add properties
    for prop in properties:
        property_def = {
            "@id": f"sm:{id_name}/{prop['name']}",
            "@type": "sm:Property",
            "rdfs:label": prop['name'],
            "rdfs:comment": f"{prop['name']} measurement",
            "sm:dataType": f"xsd:{prop.get('dataType', 'float')}",
            "sm:accessMode": "read"
        }
        
        if 'unit' in prop:
            property_def["sm:unit"] = f"unit:{prop['unit']}"
        
        profile["sm:properties"].append(property_def)
    
    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(profile, f, indent=2)
    
    logger.info(f"✓ Profile written to: {output_path}")


def main():
    """Interactive profile generator."""
    print("=" * 60)
    print("SM PROFILE GENERATOR")
    print("=" * 60)
    
    # Get equipment name
    equipment_name = input("\nEquipment Type Name (e.g., 'Turbine Meter'): ").strip()
    if not equipment_name:
        logger.error("Equipment name required")
        sys.exit(1)
    
    # Get properties
    properties = []
    print("\nEnter properties (blank name to finish):")
    
    while True:
        print(f"\nProperty #{len(properties) + 1}")
        name = input("  Name: ").strip()
        if not name:
            break
        
        dataType = input("  Data Type [float/string/boolean] (default: float): ").strip() or "float"
        unit = input("  Unit (e.g., M3-PER-HR, KiloPA) [optional]: ").strip()
        
        prop = {
            "name": name,
            "dataType": dataType
        }
        if unit:
            prop["unit"] = unit
        
        properties.append(prop)
    
    if not properties:
        logger.error("At least one property required")
        sys.exit(1)
    
    # Generate filename
    filename = equipment_name.lower().replace(' ', '_') + '.jsonld'
    output_path = Path(f'../profiles/{filename}')
    
    # Generate profile
    try:
        create_profile_skeleton(equipment_name, properties, output_path)
        print(f"\n✓ Profile generated successfully!")
        print(f"  Location: {output_path}")
        print(f"\nValidate with:")
        print(f"  python validate_profile.py {output_path}")
    except Exception as e:
        logger.error(f"Failed to generate profile: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
