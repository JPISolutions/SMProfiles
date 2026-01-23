#!/usr/bin/env python3
"""
SM Profile Validator
Validates CESMII Smart Manufacturing profiles for syntax and semantic correctness.
"""

import json
import logging
import sys
from pathlib import Path
from typing import Dict, List, Tuple

import jsonschema
from pyld import jsonld

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('validation.log')
    ]
)
logger = logging.getLogger(__name__)


class SMProfileValidator:
    """Validates SM Profiles against CESMII standards."""
    
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
    
    def validate_file(self, filepath: Path) -> Tuple[bool, List[str], List[str]]:
        """
        Validate an SM Profile file.
        
        Args:
            filepath: Path to the JSON-LD profile file
            
        Returns:
            Tuple of (is_valid, errors, warnings)
        """
        logger.info(f"Validating profile: {filepath}")
        self.errors = []
        self.warnings = []
        
        # Load the file
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                profile = json.load(f)
        except json.JSONDecodeError as e:
            error_msg = f"Invalid JSON: {e}"
            logger.error(error_msg)
            self.errors.append(error_msg)
            return False, self.errors, self.warnings
        except Exception as e:
            error_msg = f"Failed to read file: {e}"
            logger.error(error_msg)
            self.errors.append(error_msg)
            return False, self.errors, self.warnings
        
        # Validate structure
        self._validate_structure(profile)
        self._validate_context(profile)
        self._validate_properties(profile)
        self._validate_units(profile)
        
        is_valid = len(self.errors) == 0
        
        if is_valid:
            logger.info("Profile is valid")
        else:
            logger.error(f"Profile validation failed with {len(self.errors)} error(s)")
        
        if self.warnings:
            logger.warning(f"Profile has {len(self.warnings)} warning(s)")
        
        return is_valid, self.errors, self.warnings
    
    def _validate_structure(self, profile: Dict) -> None:
        """Validate basic SM Profile structure."""
        logger.debug("Validating structure...")
        
        required_fields = ['@context', '@id', '@type', 'rdfs:label']
        for field in required_fields:
            if field not in profile:
                self.errors.append(f"Missing required field: {field}")
        
        if '@type' in profile and profile['@type'] != 'sm:EquipmentType':
            self.warnings.append(f"Unexpected @type: {profile['@type']}")
    
    def _validate_context(self, profile: Dict) -> None:
        """Validate JSON-LD context."""
        logger.debug("Validating @context...")
        
        if '@context' not in profile:
            return
        
        context = profile['@context']
        required_namespaces = ['sm', 'rdfs', 'xsd']
        
        for ns in required_namespaces:
            if ns not in context:
                self.warnings.append(f"Missing recommended namespace: {ns}")
    
    def _validate_properties(self, profile: Dict) -> None:
        """Validate property definitions."""
        logger.debug("Validating properties...")
        
        if 'sm:properties' not in profile:
            self.warnings.append("No properties defined")
            return
        
        properties = profile['sm:properties']
        if not isinstance(properties, list):
            self.errors.append("sm:properties must be an array")
            return
        
        # Data types that don't require units
        unitless_types = ['xsd:string', 'xsd:boolean', 'xsd:integer', 'xsd:dateTime']
        
        for idx, prop in enumerate(properties):
            if '@id' not in prop:
                self.errors.append(f"Property {idx} missing @id")
            if '@type' not in prop:
                self.errors.append(f"Property {idx} missing @type")
            if 'rdfs:label' not in prop:
                self.warnings.append(f"Property {idx} missing label")
            if 'sm:dataType' not in prop:
                self.warnings.append(f"Property {idx} missing dataType")
            
            # Only warn about missing units for numeric types that should have them
            data_type = prop.get('sm:dataType')
            if 'sm:unit' not in prop and data_type not in unitless_types:
                self.warnings.append(f"Property {idx} ({prop.get('rdfs:label', 'unknown')}) missing unit")
    
    def _validate_units(self, profile: Dict) -> None:
        """Validate unit definitions."""
        logger.debug("Validating units...")
        
        if 'sm:properties' not in profile:
            return
        
        valid_unit_prefixes = ['unit:', 'qudt:']
        
        for prop in profile['sm:properties']:
            if 'sm:unit' in prop:
                unit = prop['sm:unit']
                if not any(unit.startswith(prefix) for prefix in valid_unit_prefixes):
                    self.warnings.append(
                        f"Property {prop.get('rdfs:label')} has non-standard unit: {unit}"
                    )


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python validate_profile.py <profile.jsonld>")
        sys.exit(1)
    
    filepath = Path(sys.argv[1])
    
    if not filepath.exists():
        logger.error(f"File not found: {filepath}")
        sys.exit(1)
    
    validator = SMProfileValidator()
    is_valid, errors, warnings = validator.validate_file(filepath)
    
    # Print results
    print("\n" + "="*60)
    print("VALIDATION RESULTS")
    print("="*60)
    
    if errors:
        print("\nERRORS:")
        for error in errors:
            print(f"  [ERROR] {error}")
    
    if warnings:
        print("\nWARNINGS:")
        for warning in warnings:
            print(f"  [WARN] {warning}")
    
    if is_valid:
        print("\n[PASS] Profile is valid!")
        sys.exit(0)
    else:
        print("\n[FAIL] Profile validation failed")
        sys.exit(1)


if __name__ == '__main__':
    main()
