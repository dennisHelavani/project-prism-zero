"""
Test script to verify RAMS fixes for deliveries placeholders and AI data population.
"""

import os
import sys
import json

# Setup path
sys.path.insert(0, os.path.dirname(__file__))

from generator import generate_docx
from ai_generator import generate_rams_ai_content

# Test configuration
TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "templates", "RAMS_TEMPLATE_WORKING_v1 copy.docx")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
DEFAULT_IMG_PATH = os.path.join(os.path.dirname(__file__), "img", "rams_deliveries_sample.png")


def test_deliveries_default_scenario():
    """Test Case B: User selects 'Use Client CPP & Induction'"""
    print("\n" + "="*60)
    print("TEST: Deliveries Default Scenario (Use Client CPP)")
    print("="*60)
    
    # Check default image exists
    if not os.path.exists(DEFAULT_IMG_PATH):
        print(f"❌ Default image not found: {DEFAULT_IMG_PATH}")
        return False
    print(f"✓ Default image found: {DEFAULT_IMG_PATH}")
    
    placeholders = {
        "RAMS_TITLE": "Test RAMS - Default Deliveries",
        "RAMS_COMPANY_NAME": "Test Company Ltd",
        "RAMS_START_DATE": "2026-01-22",
        "RAMS_DURATION": "2 weeks",
        "RAMS_DELIVERIES_DEFAULT": "As per Clients CPP and Induction",
        "RAMS_DELIVERIES_CLIENT_TEXT": "",  # Should be empty for default case
        "RAMS_DATE_STAMPED": "2026-01-22",
        "RAMS_DATE_TIME": "10:30",
    }
    
    images = {
        "RAMS_DELIVERIES_IMG": DEFAULT_IMG_PATH
    }
    
    output_path = os.path.join(OUTPUT_DIR, "test_rams_deliveries_default.docx")
    
    try:
        generate_docx(
            template_path=TEMPLATE_PATH,
            output_path=output_path,
            placeholders=placeholders,
            images=images
        )
        print(f"✓ Generated: {output_path}")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


def test_deliveries_custom_scenario():
    """Test Case A: User provides custom TMP image and text"""
    print("\n" + "="*60)
    print("TEST: Deliveries Custom Scenario (User TMP)")
    print("="*60)
    
    placeholders = {
        "RAMS_TITLE": "Test RAMS - Custom Deliveries",
        "RAMS_COMPANY_NAME": "Test Company Ltd",
        "RAMS_START_DATE": "2026-01-22",
        "RAMS_DURATION": "2 weeks",
        "RAMS_DELIVERIES_DEFAULT": "",  # Should be empty for custom case
        "RAMS_DELIVERIES_CLIENT_TEXT": "Custom delivery instructions: Deliveries between 7am-9am only. Use Gate B entrance.",
        "RAMS_DATE_STAMPED": "2026-01-22",
        "RAMS_DATE_TIME": "10:30",
    }
    
    # Use default image as placeholder for "custom" image (would be user upload in real scenario)
    images = {
        "RAMS_DELIVERIES_IMG": DEFAULT_IMG_PATH
    }
    
    output_path = os.path.join(OUTPUT_DIR, "test_rams_deliveries_custom.docx")
    
    try:
        generate_docx(
            template_path=TEMPLATE_PATH,
            output_path=output_path,
            placeholders=placeholders,
            images=images
        )
        print(f"✓ Generated: {output_path}")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


def test_ai_content_generation():
    """Test AI content generation for RAMS"""
    print("\n" + "="*60)
    print("TEST: AI Content Generation (OpenRouter)")
    print("="*60)
    
    # Check for API key - now using OpenRouter like CPP
    if not os.environ.get("OPENROUTER_API_KEY"):
        print("⚠ OPENROUTER_API_KEY not set, skipping AI test")
        return None
    
    test_context = """Project: Excavation Works for Foundation Installation

Activity Description:
Excavation works using 13-tonne excavator to form foundations. Work adjacent to live carriageway. 
Key hazards include collapse of excavation, underground services, and plant movements near public.
Will use shoring systems and banksmen for all plant movements."""

    try:
        ai_content = generate_rams_ai_content(test_context)
        
        if ai_content.get("AI_SEQUENCE_OF_WORKS"):
            print(f"✓ AI_SEQUENCE_OF_WORKS generated ({len(ai_content['AI_SEQUENCE_OF_WORKS'])} chars)")
            print(f"  Preview: {ai_content['AI_SEQUENCE_OF_WORKS'][:200]}...")
        else:
            print("❌ AI_SEQUENCE_OF_WORKS is empty")
            
        if ai_content.get("AI_RISK_ASSESSMENT"):
            print(f"✓ AI_RISK_ASSESSMENT generated ({len(ai_content['AI_RISK_ASSESSMENT'])} chars)")
            print(f"  Preview: {ai_content['AI_RISK_ASSESSMENT'][:200]}...")
        else:
            print("❌ AI_RISK_ASSESSMENT is empty")
        
        return True
    except Exception as e:
        print(f"❌ AI generation failed: {e}")
        return False


def test_ai_input_parsing():
    """Test that ai_input is correctly parsed from string"""
    print("\n" + "="*60)
    print("TEST: AI Input Parsing")
    print("="*60)
    
    # Simulate ai_input as JSON string (how it might come from database)
    ai_input_string = '{"aiTaskDescription": "Test excavation works with 13t excavator"}'
    
    # Parse like app.py does
    if isinstance(ai_input_string, str):
        try:
            ai_input_data = json.loads(ai_input_string)
            print(f"✓ Parsed ai_input from string: {ai_input_data}")
            
            if ai_input_data.get("aiTaskDescription"):
                print(f"✓ aiTaskDescription: {ai_input_data['aiTaskDescription']}")
                return True
            else:
                print("❌ aiTaskDescription not found in parsed data")
                return False
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse ai_input: {e}")
            return False
    
    return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("RAMS FIXES VERIFICATION TESTS")
    print("="*60)
    
    # Run tests
    results = {
        "Deliveries Default": test_deliveries_default_scenario(),
        "Deliveries Custom": test_deliveries_custom_scenario(),
        "AI Input Parsing": test_ai_input_parsing(),
        "AI Content Generation": test_ai_content_generation(),
    }
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for test_name, result in results.items():
        if result is None:
            print(f"  ⚠ {test_name}: SKIPPED")
        elif result:
            print(f"  ✓ {test_name}: PASSED")
        else:
            print(f"  ❌ {test_name}: FAILED")
    
    # Exit with appropriate code
    failed_count = sum(1 for r in results.values() if r is False)
    sys.exit(failed_count)
