#!/usr/bin/env python3
"""
CLI wrapper for document generation from submission ID.
Called by Next.js API route via subprocess.
"""

import sys
import json
import logging
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

from supabase_client import get_submission, update_submission_outputs
from generator import generate_docx
from pdf_convert import convert_to_pdf
from ai_generator import generate_cpp_ai_content, generate_rams_ai_content
from app import _process_cpp_blue_flags, download_images_from_urls
import os
import tempfile
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), 'templates')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing submission_id argument"}))
        sys.exit(1)
    
    submission_id = sys.argv[1]
    
    try:
        # Fetch submission
        submission = get_submission(submission_id)
        if not submission:
            print(json.dumps({"error": f"Submission not found: {submission_id}"}))
            sys.exit(1)
        
        product = submission.get("product", "").upper()
        placeholders = submission.get("placeholders", {})
        uploads = submission.get("uploads", {})
        
        logger.info(f"Processing {product} submission: {submission_id}")
        
        # Generate AI content based on product type
        if product == "CPP":
            task_activity = placeholders.get("CPP_TASK_ACTIVITY", "")
            project_title = placeholders.get("CPP_PROJECT_TITLE", "")
            duration = placeholders.get("CPP_DURATION", "")
            
            # Read Smart Toggles from placeholders
            toggle_external = placeholders.get("TOGGLE_EXTERNAL_GROUNDWORKS", "false").lower() == "true"
            toggle_height = placeholders.get("TOGGLE_HEIGHT_STRUCTURAL", "false").lower() == "true"
            toggle_road = placeholders.get("TOGGLE_PUBLIC_ROAD_IMPACT", "false").lower() == "true"
            toggle_mep = placeholders.get("TOGGLE_MEP_COMMISSIONING", "false").lower() == "true"
            
            if task_activity:
                # Build enriched prompt context
                enriched_context = f"Project: {project_title}\nDuration: {duration}\n"
                if toggle_external:
                    enriched_context += "User indicated: External Site / Groundworks\n"
                if toggle_height:
                    enriched_context += "User indicated: Structural / Height Work\n"
                if toggle_road:
                    enriched_context += "User indicated: Public Road / Footway Impact\n"
                if toggle_mep:
                    enriched_context += "User indicated: M&E Commissioning\n"
                enriched_context += f"\nActivity Description:\n{task_activity}"
                
                ai_content = generate_cpp_ai_content(enriched_context)
                
                # Override AI blue flags with user's explicit toggles
                ai_content["BLUE_FLAG_SECURE_PERIMETER_HOARDING"] = toggle_external
                ai_content["BLUE_FLAG_HEAVY_LOGISTICS_LAYDOWN"] = toggle_external
                ai_content["BLUE_FLAG_COMPETENCE_PLANT_HEIGHT"] = toggle_height
                ai_content["BLUE_FLAG_SECTION_16_FACADE"] = toggle_height
                ai_content["BLUE_FLAG_PUBLIC_TRAFFIC_MGMT"] = toggle_road
                ai_content["BLUE_FLAG_SECTION_17_COMMISSIONING"] = toggle_mep
                
                placeholders.update(ai_content)
                
        elif product == "RAMS":
            rams_title = placeholders.get("RAMS_TITLE", "")
            ai_input_data = submission.get("ai_input", {})
            
            if isinstance(ai_input_data, str):
                try:
                    ai_input_data = json.loads(ai_input_data)
                except json.JSONDecodeError:
                    ai_input_data = {}
            
            ai_task_description = ai_input_data.get("aiTaskDescription", "") if ai_input_data else ""
            ai_context = f"Project: {rams_title}" if rams_title else ""
            if ai_task_description:
                ai_context += f"\n\nActivity Description:\n{ai_task_description}"
            
            if ai_context.strip():
                ai_content = generate_rams_ai_content(ai_context)
                placeholders.update(ai_content)
        
        # Determine template
        template_map = {
            "CPP": "CPP_TEMPLATE_WORKING_v1 copy.docx",
            "RAMS": "RAMS_TEMPLATE_WORKING_v1 copy.docx"
        }
        template_path = os.path.join(TEMPLATE_DIR, template_map.get(product, ""))
        
        if not os.path.exists(template_path):
            print(json.dumps({"error": f"Template not found: {template_path}"}))
            sys.exit(1)
        
        # Generate output filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        basename = f"{product}_{submission_id[:8]}_{timestamp}"
        docx_path = os.path.join(OUTPUT_DIR, f"{basename}.docx")
        
        # Download images if any
        temp_dir = tempfile.mkdtemp(prefix="doc_gen_")
        local_images = download_images_from_urls(uploads, temp_dir) if uploads else {}
        
        # Process blue flags for CPP
        blue_flags = {}
        if product == "CPP":
            blue_flags = _process_cpp_blue_flags(placeholders)
        
        # Generate DOCX
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        generate_docx(template_path, docx_path, placeholders, local_images, blue_flags)
        logger.info(f"DOCX generated: {docx_path}")
        
        # Convert to PDF
        pdf_path = convert_to_pdf(docx_path, OUTPUT_DIR)
        logger.info(f"PDF generated: {pdf_path}")
        
        # Update Supabase
        outputs = {
            "docx_path": docx_path,
            "pdf_path": pdf_path,
            "generated_at": datetime.now().isoformat()
        }
        update_submission_outputs(submission_id, outputs)
        logger.info(f"Submission updated: {submission_id}")
        
        # Output success JSON
        print(json.dumps({
            "success": True,
            "docx_path": docx_path,
            "pdf_path": pdf_path,
            "submission_id": submission_id
        }))
        sys.exit(0)
        
    except Exception as e:
        logger.exception(f"Generation failed: {e}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
