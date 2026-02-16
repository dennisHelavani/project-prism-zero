"""
FastAPI application for DOCX/PDF document generation.
"""

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

import os
import json
import logging
import requests
import tempfile
import shutil
from datetime import datetime
from typing import Optional, Dict
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel

from generator import generate_docx, TemplateNotFoundError
from pdf_convert import convert_to_pdf, LibreOfficeError
from supabase_client import get_submission, update_submission_outputs
from ai_generator import generate_cpp_ai_content, generate_rams_ai_content

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Hard Hat AI Doc Generator",
    description="DOCX/PDF generation service for CPP and RAMS documents",
    version="1.0.0"
)

# Auth key – if set, callers must send X-DOCGEN-KEY header
DOCGEN_KEY = os.environ.get('DOCGEN_KEY', '')

# Environment configuration
TEMPLATE_DIR = os.environ.get('TEMPLATE_DIR', os.path.join(os.path.dirname(__file__), 'templates'))
OUTPUT_DIR = os.environ.get('OUTPUT_DIR', os.path.join(os.path.dirname(__file__), 'output'))

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)


# Standard Boilerplate Text for Conditional Sections
# When a Blue Flag is True, this text replaces the {{include_...}} placeholder.
# When False, the section is removed (or replaced with empty string).
CPP_BLUE_FLAG_BOILERPLATES = {
    # Section 3.2 - Competence (2 bullets with unique keys)
    "include_competence_plant_height_1": "All personnel to hold strictly relevant CSCS/CPCS/IPAF/NPORS qualifications for their specific task activity.",
    "include_competence_plant_height_2": "Site Induction mandatory; include project‑specific hazards (height, lifting, façade access, traffic interface, public protection, utilities, COSHH).",
    
    # Section 4.1 - Site Layout (laydown)
    "include_heavy_logistics_laydown": "Laydown areas, crane base/pad, hoist(s), loading bay(s), waste compound, fuel store, COSHH store, first aid, drying room, offices and welfare.",
    
    # Section 4.2 - Traffic Management (2 bullets with unique keys)
    "include_public_traffic_mgmt_1": "Delivery booking system; off‑peak deliveries where required by local authority.",
    "include_public_traffic_mgmt_2": "TTRO/permits for footway closures, gantries or scaffold encroachments.",
    
    # Section 4.3 - Security (hoarding)
    "include_secure_perimeter_hoarding": "Hoarding to suitable standard, secure gates, CCTV if required, intruder alarm out‑of‑hours.",
    
    # Section 15 - Materials Handling (uses same toggle as 4.1 external)
    "include_heavy_logistics_laydown_15": "Laydown plans; exclusion zones for loading bays/hoists; max loadings for floors set and signed.",
    
    # Section 16 - Access, Scaffolding & Façade Access (3 separate placeholders needed in template)
    "include_section_16_facade_1": "Independent scaffolds, stair towers, protection fans and gantries designed and inspected.",
    "include_section_16_facade_2": "MEWP selection by task; rescue plans; IPAF operators only.",
    "include_section_16_facade_3": "Mast climbers/building maintenance units (BMUs) planned with load checks and emergency procedures.",
    
    # Section 17 - Testing, Commissioning & Handover (3 separate placeholders needed in template)
    "include_section_17_commissioning_1": "Commissioning plan by systems: LV/HV, life safety, HVAC, water (chlorination/flushing), lifts, BMS.",
    "include_section_17_commissioning_2": "Pre‑commissioning checklists; witness testing; seasonal commissioning; training and O&M manuals.",
    "include_section_17_commissioning_3": "Building Control completion and fire strategy sign‑offs; Client training and soft‑landings support.",
}


class GenerateRequest(BaseModel):
    product: str  # "CPP" or "RAMS"
    placeholders: dict
    images: Optional[dict] = {}
    output_basename: Optional[str] = None


class GenerateFromSubmissionRequest(BaseModel):
    submission_id: str


class GenerateResponse(BaseModel):
    docx_path: str
    pdf_path: Optional[str] = None


class GenerateFromSubmissionResponse(BaseModel):
    docx_path: str
    pdf_path: Optional[str] = None
    updated_submission_id: Optional[str] = None

def _process_cpp_blue_flags(placeholders: dict):
    """
    Process Blue Flag logic for CPP:
    1. Extract boolean flags (from AI or Toggles)
    2. Inject Standard Text into placeholders if Flag=True
    3. Inject Empty String if Flag=False (to hide the {{include_...}} placeholder)
    4. For sections 16 & 17: determine if section should be removed based on individual bullets
    5. Return the dict of flags for _apply_blue_logic to use (for removing bullets/sections)
    """
    blue_flags = {}
    
    # === STANDARD BLUE FLAGS (single flag controls all placeholders in group) ===
    standard_flag_to_templates = {
        "BLUE_FLAG_COMPETENCE_PLANT_HEIGHT": [
            "include_competence_plant_height_1",
            "include_competence_plant_height_2",
        ],
        "BLUE_FLAG_HEAVY_LOGISTICS_LAYDOWN": [
            "include_heavy_logistics_laydown",
            "include_heavy_logistics_laydown_15",
        ],
        "BLUE_FLAG_PUBLIC_TRAFFIC_MGMT": [
            "include_public_traffic_mgmt_1",
            "include_public_traffic_mgmt_2",
        ],
        "BLUE_FLAG_SECURE_PERIMETER_HOARDING": [
            "include_secure_perimeter_hoarding",
        ],
    }
    
    for internal_key, template_keys in standard_flag_to_templates.items():
        # Get the boolean flag value (default to True if missing to be safe)
        flag_value = placeholders.get(internal_key, True)
        
        # Store in blue_flags result for generator
        blue_flags[internal_key] = flag_value
        
        # Handle each TEMPLATE content placeholder
        for template_key in template_keys:
            if flag_value:
                # TRUE: Inject standard boilerplate text
                if template_key not in placeholders:
                    placeholders[template_key] = CPP_BLUE_FLAG_BOILERPLATES.get(template_key, "")
            else:
                # FALSE: Clear the placeholder so it doesn't show as {{...}}
                placeholders[template_key] = ""
            
        # Clean up the internal boolean key from placeholders
        if internal_key in placeholders:
            del placeholders[internal_key]
    
    # === SECTION 16 & 17: Individual bullet control ===
    # Each bullet can be true/false independently
    # Section is removed only if ALL bullets are false
    
    section_bullet_configs = {
        "BLUE_FLAG_SECTION_16_FACADE": [
            "include_section_16_facade_1",
            "include_section_16_facade_2",
            "include_section_16_facade_3",
        ],
        "BLUE_FLAG_SECTION_17_COMMISSIONING": [
            "include_section_17_commissioning_1",
            "include_section_17_commissioning_2",
            "include_section_17_commissioning_3",
        ],
    }
    
    for section_flag, bullet_keys in section_bullet_configs.items():
        any_bullet_true = False
        
        for bullet_key in bullet_keys:
            # Check if this specific bullet should be included
            # It could come from AI decision or form toggle
            # Default to True (include) if not specified
            bullet_value = placeholders.get(bullet_key, True)
            
            # Handle different possible values (bool, string "true"/"false", or actual content)
            if isinstance(bullet_value, bool):
                include_bullet = bullet_value
            elif isinstance(bullet_value, str):
                if bullet_value.lower() == "true":
                    include_bullet = True
                elif bullet_value.lower() == "false":
                    include_bullet = False
                else:
                    # It's already content text, keep it
                    include_bullet = True
                    any_bullet_true = True
                    continue
            else:
                include_bullet = True
            
            if include_bullet:
                any_bullet_true = True
                # Inject boilerplate text if not already set
                if bullet_key not in placeholders or placeholders.get(bullet_key) in [True, "true", "True"]:
                    placeholders[bullet_key] = CPP_BLUE_FLAG_BOILERPLATES.get(bullet_key, "")
            else:
                # Clear the placeholder
                placeholders[bullet_key] = ""
        
        # Store whether section should be removed (all bullets false = remove section)
        blue_flags[section_flag] = any_bullet_true
        
        # Clean up main flag from placeholders if present
        if section_flag in placeholders:
            del placeholders[section_flag]
            
    return blue_flags


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "template_dir": TEMPLATE_DIR,
        "output_dir": OUTPUT_DIR,
        "templates_available": os.listdir(TEMPLATE_DIR) if os.path.exists(TEMPLATE_DIR) else []
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    """
    Generate DOCX and PDF from provided placeholders.
    
    Args:
        request: GenerateRequest with product, placeholders, optional images, optional output_basename
    
    Returns:
        GenerateResponse with paths to generated DOCX and PDF files
    """
    logger.info(f"Generate request: product={request.product}")
    
    # Validate product
    product = request.product.upper()
    if product not in ("CPP", "RAMS"):
        raise HTTPException(status_code=400, detail=f"Invalid product: {product}. Must be 'CPP' or 'RAMS'")
    
    # Determine template path
    template_map = {
        "CPP": "CPP_TEMPLATE_WORKING_v1_copy.docx",
        "RAMS": "RAMS_TEMPLATE_WORKING_v1_copy.docx"
    }
    template_path = os.path.join(TEMPLATE_DIR, template_map[product])
    
    # Generate output filename
    if request.output_basename:
        basename = request.output_basename
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        basename = f"{product}_{timestamp}"
    
    docx_path = os.path.join(OUTPUT_DIR, f"{basename}.docx")
    
    # Get placeholders as a mutable dict
    placeholders = dict(request.placeholders)
    
    # Generate AI content for CPP products
    if product == "CPP":
        task_activity = placeholders.get("CPP_TASK_ACTIVITY", "")
        project_title = placeholders.get("CPP_PROJECT_TITLE", "")
        duration = placeholders.get("CPP_DURATION", "")
        
        # Read Smart Toggles
        toggle_external = str(placeholders.get("TOGGLE_EXTERNAL_GROUNDWORKS", "false")).lower() == "true"
        toggle_height = str(placeholders.get("TOGGLE_HEIGHT_STRUCTURAL", "false")).lower() == "true"
        toggle_road = str(placeholders.get("TOGGLE_PUBLIC_ROAD_IMPACT", "false")).lower() == "true"
        toggle_mep = str(placeholders.get("TOGGLE_MEP_COMMISSIONING", "false")).lower() == "true"
        
        logger.info(f"Smart Toggles: external={toggle_external}, height={toggle_height}, road={toggle_road}, mep={toggle_mep}")
        
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
            
            logger.info("Generating AI content for CPP...")
            ai_content = generate_cpp_ai_content(enriched_context)
            
            # Override with user toggles
            ai_content["BLUE_FLAG_SECURE_PERIMETER_HOARDING"] = toggle_external
            ai_content["BLUE_FLAG_HEAVY_LOGISTICS_LAYDOWN"] = toggle_external
            ai_content["BLUE_FLAG_COMPETENCE_PLANT_HEIGHT"] = toggle_height
            ai_content["BLUE_FLAG_SECTION_16_FACADE"] = toggle_height
            ai_content["BLUE_FLAG_PUBLIC_TRAFFIC_MGMT"] = toggle_road
            ai_content["BLUE_FLAG_SECTION_17_COMMISSIONING"] = toggle_mep
            
            placeholders.update(ai_content)
            logger.info(f"AI content merged: {list(ai_content.keys())}")
    
    # Process Blue Flags using shared helper
    # This injects boilerplate text (if True) or clears placeholders (if False)
    # and returns the boolean flags for the generator to use for bullet/section removal
    blue_flags = _process_cpp_blue_flags(placeholders)
    logger.info(f"Blue flags processed: {blue_flags}")
    
    try:
        # Generate DOCX
        logger.info(f"Generating DOCX: {docx_path}")
        generate_docx(
            template_path=template_path,
            output_path=docx_path,
            placeholders=placeholders,
            images=request.images or {},
            blue_flags=blue_flags
        )
        logger.info(f"DOCX generated successfully: {docx_path}")
        
        # Convert to PDF
        logger.info(f"Converting to PDF...")
        pdf_path = convert_to_pdf(docx_path, OUTPUT_DIR)
        logger.info(f"PDF generated successfully: {pdf_path}")
        
        return GenerateResponse(docx_path=docx_path, pdf_path=pdf_path)
    
    except TemplateNotFoundError as e:
        logger.error(f"Template not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except LibreOfficeError as e:
        logger.warning(f"PDF conversion failed (continuing with DOCX only): {e}")
        return GenerateResponse(docx_path=docx_path, pdf_path=None)
    except Exception as e:
        logger.exception(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Document generation failed: {e}")


def download_images_from_urls(uploads: Dict[str, str], temp_dir: str) -> Dict[str, str]:
    """
    Download images from URLs to temporary local files.
    
    Args:
        uploads: Dict mapping placeholder names to URLs
        temp_dir: Directory to save downloaded files
    
    Returns:
        Dict mapping placeholder names to local file paths
    """
    local_images = {}
    
    for placeholder_key, url in uploads.items():
        if not url:
            continue
            
        try:
            logger.info(f"Downloading image for {placeholder_key} from {url}")
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # Determine file extension from URL or content type
            ext = 'png'
            if '.' in url:
                ext = url.split('.')[-1].split('?')[0]  # Remove query params
            elif 'content-type' in response.headers:
                content_type = response.headers['content-type']
                if 'jpeg' in content_type or 'jpg' in content_type:
                    ext = 'jpg'
                elif 'png' in content_type:
                    ext = 'png'
            
            # Save to temp file
            temp_filename = f"{placeholder_key}.{ext}"
            temp_path = os.path.join(temp_dir, temp_filename)
            
            with open(temp_path, 'wb') as f:
                f.write(response.content)
            
            local_images[placeholder_key] = temp_path
            logger.info(f"Downloaded {placeholder_key} to {temp_path}")
            
        except Exception as e:
            logger.error(f"Failed to download image for {placeholder_key}: {e}")
            continue
    
    return local_images


@app.post("/generate-from-submission", response_model=GenerateFromSubmissionResponse)
def generate_from_submission(
    request: GenerateFromSubmissionRequest,
    x_docgen_key: Optional[str] = Header(default=None),
):
    """
    Generate DOCX and PDF from a Supabase submission ID.
    
    Args:
        request: GenerateFromSubmissionRequest with submission_id
    
    Returns:
        GenerateFromSubmissionResponse with paths and updated submission ID
    """
    # Auth check
    if DOCGEN_KEY and x_docgen_key != DOCGEN_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    logger.info(f"Generate from submission: id={request.submission_id}")
    
    # Fetch submission from Supabase
    try:
        submission = get_submission(request.submission_id)
    except Exception as e:
        logger.error(f"Failed to fetch submission: {e}")
        raise HTTPException(status_code=404, detail=f"Submission not found: {e}")
    
    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission not found: {request.submission_id}")
    
    product = submission.get("product", "").upper()
    placeholders = submission.get("placeholders", {})
    uploads = submission.get("uploads", {})
    
    logger.info(f"Submission data: product={product}, placeholders_count={len(placeholders)}")
    logger.info(f"Submission keys: {list(submission.keys())}")
    
    # Write debug file
    try:
        with open("debug_log.txt", "a") as f:
            f.write(f"\n--- New Request {datetime.now()} ---\n")
            f.write(f"Product: {product}\n")
            f.write(f"Submission Keys: {list(submission.keys())}\n")
            if 'ai_input' in submission:
                f.write(f"AI Input: {submission['ai_input']}\n")
            else:
                f.write("AI Input: MISSING\n")
            f.write(f"RAMS Title: {placeholders.get('RAMS_TITLE', 'MISSING')}\n")
    except Exception as e:
        logger.error(f"Failed to write debug log: {e}")

    logger.info(f"AI Input present: {'ai_input' in submission}")
    if 'ai_input' in submission:
        logger.info(f"AI Input keys: {list(submission['ai_input'].keys())}")
    
    logger.info(f"Product check: '{product}'")
    
    # Generate AI content for CPP products
    if product == "CPP":
        task_activity = placeholders.get("CPP_TASK_ACTIVITY", "")
        project_title = placeholders.get("CPP_PROJECT_TITLE", "")
        duration = placeholders.get("CPP_DURATION", "")
        
        # Read Smart Toggles from placeholders (they come as strings "true"/"false")
        toggle_external = placeholders.get("TOGGLE_EXTERNAL_GROUNDWORKS", "false").lower() == "true"
        toggle_height = placeholders.get("TOGGLE_HEIGHT_STRUCTURAL", "false").lower() == "true"
        toggle_road = placeholders.get("TOGGLE_PUBLIC_ROAD_IMPACT", "false").lower() == "true"
        toggle_mep = placeholders.get("TOGGLE_MEP_COMMISSIONING", "false").lower() == "true"
        
        logger.info(f"Smart Toggles: external={toggle_external}, height={toggle_height}, road={toggle_road}, mep={toggle_mep}")
        
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
            
            logger.info("Generating AI content for CPP with enriched context...")
            ai_content = generate_cpp_ai_content(enriched_context)
            
            # Override AI blue flags with user's explicit toggles
            # User toggles take precedence over AI inference
            ai_content["BLUE_FLAG_SECURE_PERIMETER_HOARDING"] = toggle_external
            ai_content["BLUE_FLAG_HEAVY_LOGISTICS_LAYDOWN"] = toggle_external
            ai_content["BLUE_FLAG_COMPETENCE_PLANT_HEIGHT"] = toggle_height
            ai_content["BLUE_FLAG_SECTION_16_FACADE"] = toggle_height
            ai_content["BLUE_FLAG_PUBLIC_TRAFFIC_MGMT"] = toggle_road
            ai_content["BLUE_FLAG_SECTION_17_COMMISSIONING"] = toggle_mep
            
            placeholders.update(ai_content)
            logger.info(f"AI content merged with toggle overrides: {list(ai_content.keys())}")
        else:
            logger.warning("CPP_TASK_ACTIVITY is empty, skipping AI generation")
    
    # Generate AI content for RAMS products
    elif product == "RAMS":
        rams_title = placeholders.get("RAMS_TITLE", "")
        
        # Get AI task description from ai_input (passed separately from placeholders)
        ai_task_description = ""
        ai_input_data = submission.get("ai_input", {})
        
        # Handle case where ai_input might be stored as a JSON string instead of dict
        if isinstance(ai_input_data, str):
            try:
                ai_input_data = json.loads(ai_input_data)
                logger.info("RAMS ai_input was a string, parsed to dict")
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse ai_input as JSON: {e}")
                ai_input_data = {}
        
        logger.info(f"RAMS ai_input data type: {type(ai_input_data).__name__}, content: {ai_input_data}")
        
        if ai_input_data and isinstance(ai_input_data, dict):
            ai_task_description = ai_input_data.get("aiTaskDescription", "")
        
        logger.info(f"RAMS_TITLE: '{rams_title[:50]}...' " if rams_title else "RAMS_TITLE: (empty)")
        logger.info(f"aiTaskDescription: '{ai_task_description[:100]}...'" if ai_task_description else "aiTaskDescription: (empty)")
        
        # Combine title and description for richer AI context
        ai_context = f"Project: {rams_title}" if rams_title else ""
        if ai_task_description:
            ai_context += f"\n\nActivity Description:\n{ai_task_description}"
        
        if ai_context.strip():
            logger.info(f"Generating AI content for RAMS with context: {ai_context[:150]}...")
            ai_content = generate_rams_ai_content(ai_context)
            placeholders.update(ai_content)
            logger.info(f"RAMS AI content merged: {list(ai_content.keys())}")
            if ai_content.get("AI_SEQUENCE_OF_WORKS"):
                logger.info(f"AI_SEQUENCE_OF_WORKS preview: {ai_content['AI_SEQUENCE_OF_WORKS'][:200]}...")
            if ai_content.get("AI_RISK_ASSESSMENT"):
                risk_content = ai_content['AI_RISK_ASSESSMENT']
                has_pipes = '|' in risk_content
                logger.info(f"AI_RISK_ASSESSMENT preview ({len(risk_content)} chars, has_pipes={has_pipes}): {risk_content[:300]}...")
                if not has_pipes:
                    logger.warning("AI_RISK_ASSESSMENT does NOT have pipe separators - table will NOT be generated!")
            else:
                logger.warning("AI_RISK_ASSESSMENT is EMPTY - no content from AI!")
        else:
            logger.warning("RAMS_TITLE and aiTaskDescription are empty, skipping AI generation")
    
    # Validate product
    if product not in ("CPP", "RAMS"):
        raise HTTPException(status_code=400, detail=f"Invalid product in submission: {product}")
    
    # Determine template path
    template_map = {
        "CPP": "CPP_TEMPLATE_WORKING_v1_copy.docx",
        "RAMS": "RAMS_TEMPLATE_WORKING_v1_copy.docx"
    }
    template_path = os.path.join(TEMPLATE_DIR, template_map[product])
    
    # Generate output filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    basename = f"{product}_{request.submission_id[:8]}_{timestamp}"
    docx_path = os.path.join(OUTPUT_DIR, f"{basename}.docx")
    
    
    try:
        # Create temp directory for downloaded images
        temp_dir = tempfile.mkdtemp(prefix="doc_gen_")
        logger.info(f"Created temp directory: {temp_dir}")
        
        # Download images from URLs to temp files
        local_images = {}
        if uploads:
            logger.info(f"Downloading {len(uploads)} images from URLs...")
            local_images = download_images_from_urls(uploads, temp_dir)
            logger.info(f"Downloaded {len(local_images)} images successfully")
        
        # RAMS Deliveries Logic:
        # Case A: Client provided BOTH image AND text → use their data
        # Case B: Client provided TEXT only (no image) → use client's text + default image
        # Case C: Client provided IMAGE only (no text) → use client's image + default text
        # Case D: No data or "Use Client CPP" → use default text + default image
        if product == "RAMS":
            has_client_deliveries_img = "RAMS_DELIVERIES_IMG" in local_images and local_images["RAMS_DELIVERIES_IMG"]
            raw_deliveries_text = placeholders.get("RAMS_DELIVERIES_TEXT", "").strip()
            uses_client_cpp = raw_deliveries_text == "As per Client CPP and Induction"
            
            # Custom text = text that is NOT empty and NOT the "Use Client CPP" option
            has_custom_text = raw_deliveries_text and not uses_client_cpp
            
            logger.info(f"RAMS Deliveries Debug: has_img={has_client_deliveries_img}, raw_text='{raw_deliveries_text[:50] if raw_deliveries_text else ''}', has_custom_text={has_custom_text}, uses_cpp={uses_client_cpp}")
            
            # Default image path
            default_img_path = os.path.join(os.path.dirname(__file__), "img", "rams_deliveries_sample.png")
            default_text = "As per Clients CPP and Induction"
            
            if has_client_deliveries_img and has_custom_text:
                # Case A: Client provided BOTH custom image and text
                logger.info("RAMS: Case A - Using client's custom IMAGE AND TEXT")
                placeholders["RAMS_DELIVERIES_CLIENT_TEXT"] = raw_deliveries_text
                placeholders["RAMS_DELIVERIES_DEFAULT"] = ""
                # local_images already has RAMS_DELIVERIES_IMG from upload
                
            elif has_custom_text and not has_client_deliveries_img:
                # Case B: Client provided TEXT only - use client text, NO image
                logger.info("RAMS: Case B - Using client's TEXT only (no image)")
                placeholders["RAMS_DELIVERIES_CLIENT_TEXT"] = raw_deliveries_text
                placeholders["RAMS_DELIVERIES_DEFAULT"] = ""
                # No image - ensure RAMS_DELIVERIES_IMG is not set
                if "RAMS_DELIVERIES_IMG" in local_images:
                    del local_images["RAMS_DELIVERIES_IMG"]
                    
            elif has_client_deliveries_img and not has_custom_text:
                # Case C: Client provided IMAGE only - use client image + DEFAULT text
                logger.info("RAMS: Case C - Using client's IMAGE + DEFAULT text")
                placeholders["RAMS_DELIVERIES_DEFAULT"] = default_text
                placeholders["RAMS_DELIVERIES_CLIENT_TEXT"] = ""
                # local_images already has RAMS_DELIVERIES_IMG from upload
                    
            else:
                # Case D: No data or "Use Client CPP" → default text + default image
                logger.info("RAMS: Case D - Using DEFAULT image AND text")
                placeholders["RAMS_DELIVERIES_DEFAULT"] = default_text
                placeholders["RAMS_DELIVERIES_CLIENT_TEXT"] = ""
                if os.path.exists(default_img_path):
                    local_images["RAMS_DELIVERIES_IMG"] = default_img_path
                    logger.info(f"RAMS: Default image set: {default_img_path}")
                else:
                    logger.warning(f"RAMS: Default image not found: {default_img_path}")
            
            logger.info(f"RAMS Deliveries Final: IMG={local_images.get('RAMS_DELIVERIES_IMG', 'NONE')[:50]}, DEFAULT='{placeholders.get('RAMS_DELIVERIES_DEFAULT', '')}', CLIENT_TEXT='{placeholders.get('RAMS_DELIVERIES_CLIENT_TEXT', '')[:30] if placeholders.get('RAMS_DELIVERIES_CLIENT_TEXT') else ''}'")
        
            # ========== FIRE PLAN LOGIC ==========
            # Case A: Client provided BOTH image AND text → use their data
            # Case B: Client provided TEXT only (no image) → use client's text, NO image
            # Case C: Client provided IMAGE only (no text) → use client's image + DEFAULT text
            # Case D: No data or "Use Client Fire Plan" → use default text + default image
            has_client_fire_plan_img = "RAMS_FIRE_PLAN_IMG" in local_images and local_images["RAMS_FIRE_PLAN_IMG"]
            raw_fire_plan_text = placeholders.get("RAMS_FIRE_PLAN_TEXT", "").strip()
            uses_client_fire_plan = raw_fire_plan_text == "As per Client Fire Plan"
            
            # Custom text = text that is NOT empty and NOT the "Use Client Fire Plan" option
            has_custom_fire_plan_text = raw_fire_plan_text and not uses_client_fire_plan
            
            logger.info(f"RAMS Fire Plan Debug: has_img={has_client_fire_plan_img}, raw_text='{raw_fire_plan_text[:50] if raw_fire_plan_text else ''}', has_custom_text={has_custom_fire_plan_text}, uses_client_plan={uses_client_fire_plan}")
            
            # Default image path for fire plan
            default_fire_plan_img_path = os.path.join(os.path.dirname(__file__), "img", "rams_fire_plan_sample.png")
            default_fire_plan_text = "Please refer to the Client's Fire Plan.\nAll emergencies must be reported to the client management team immediately."
            
            if has_client_fire_plan_img and has_custom_fire_plan_text:
                # Case A: Client provided BOTH custom image and text
                logger.info("RAMS Fire Plan: Case A - Using client's custom IMAGE AND TEXT")
                placeholders["RAMS_FIRE_PLAN_CLIENTS_TEXT"] = raw_fire_plan_text
                placeholders["RAMS_FIRE_PLAN_DEFAULT_TEXT"] = ""
                # local_images already has RAMS_FIRE_PLAN_IMG from upload
                
            elif has_custom_fire_plan_text and not has_client_fire_plan_img:
                # Case B: Client provided TEXT only - use client text, NO image
                logger.info("RAMS Fire Plan: Case B - Using client's TEXT only (no image)")
                placeholders["RAMS_FIRE_PLAN_CLIENTS_TEXT"] = raw_fire_plan_text
                placeholders["RAMS_FIRE_PLAN_DEFAULT_TEXT"] = ""
                # No image - ensure RAMS_FIRE_PLAN_IMG is not set
                if "RAMS_FIRE_PLAN_IMG" in local_images:
                    del local_images["RAMS_FIRE_PLAN_IMG"]
                    
            elif has_client_fire_plan_img and not has_custom_fire_plan_text:
                # Case C: Client provided IMAGE only - use client image + DEFAULT text
                logger.info("RAMS Fire Plan: Case C - Using client's IMAGE + DEFAULT text")
                placeholders["RAMS_FIRE_PLAN_DEFAULT_TEXT"] = default_fire_plan_text
                placeholders["RAMS_FIRE_PLAN_CLIENTS_TEXT"] = ""
                # local_images already has RAMS_FIRE_PLAN_IMG from upload
                    
            else:
                # Case D: No data or "Use Client Fire Plan" → default text + default image
                logger.info("RAMS Fire Plan: Case D - Using DEFAULT image AND text")
                placeholders["RAMS_FIRE_PLAN_DEFAULT_TEXT"] = default_fire_plan_text
                placeholders["RAMS_FIRE_PLAN_CLIENTS_TEXT"] = ""
                if os.path.exists(default_fire_plan_img_path):
                    local_images["RAMS_FIRE_PLAN_IMG"] = default_fire_plan_img_path
                    logger.info(f"RAMS Fire Plan: Default image set: {default_fire_plan_img_path}")
                else:
                    logger.warning(f"RAMS Fire Plan: Default image not found: {default_fire_plan_img_path}")
            
            logger.info(f"RAMS Fire Plan Final: IMG={local_images.get('RAMS_FIRE_PLAN_IMG', 'NONE')[:50] if local_images.get('RAMS_FIRE_PLAN_IMG') else 'NONE'}, DEFAULT='{placeholders.get('RAMS_FIRE_PLAN_DEFAULT_TEXT', '')}', CLIENT_TEXT='{placeholders.get('RAMS_FIRE_PLAN_CLIENTS_TEXT', '')[:30] if placeholders.get('RAMS_FIRE_PLAN_CLIENTS_TEXT') else ''}'")
        
        # Process Blue Flags using shared helper
        # This injects boilerplate text (if True) or clears placeholders (if False)
        # and returns the boolean flags for the generator to use for bullet/section removal
        blue_flags = _process_cpp_blue_flags(placeholders)
        logger.info(f"Blue flags processed: {blue_flags}")
        
        # Generate DOCX
        logger.info(f"Generating DOCX: {docx_path}")
        generate_docx(
            template_path=template_path,
            output_path=docx_path,
            placeholders=placeholders,
            images=local_images,  # Use local file paths
            blue_flags=blue_flags  # Pass blue flags for conditional removal
        )
        logger.info(f"DOCX generated successfully: {docx_path}")
        
        # Convert to PDF
        logger.info(f"Converting to PDF...")
        pdf_path = convert_to_pdf(docx_path, OUTPUT_DIR)
        logger.info(f"PDF generated successfully: {pdf_path}")
        
        # Update submission with outputs
        outputs = {
            "docx_path": docx_path,
            "pdf_path": pdf_path,
            "generated_at": datetime.now().isoformat()
        }
        
        logger.info(f"Updating submission outputs...")
        update_submission_outputs(request.submission_id, outputs)
        logger.info(f"Submission updated successfully")
        
        return GenerateFromSubmissionResponse(
            docx_path=docx_path,
            pdf_path=pdf_path,
            updated_submission_id=request.submission_id
        )
        
    except TemplateNotFoundError as e:
        logger.error(f"Template not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except LibreOfficeError as e:
        logger.warning(f"PDF conversion failed (continuing with DOCX only): {e}")
        
        # Update submission with DOCX only and error message
        outputs = {
            "docx_path": docx_path,
            "pdf_path": None,
            "pdf_error": str(e),
            "generated_at": datetime.now().isoformat()
        }
        
        try:
            logger.info(f"Updating submission outputs (DOCX only)...")
            update_submission_outputs(request.submission_id, outputs)
        except Exception as update_err:
            logger.error(f"Failed to update submission after PDF error: {update_err}")

        return GenerateFromSubmissionResponse(
            docx_path=docx_path,
            pdf_path=None,
            updated_submission_id=request.submission_id
        )
    except Exception as e:
        logger.exception(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Document generation failed: {e}")


@app.get("/download/{submission_id}")
def download_document(submission_id: str, format: str = "docx"):
    """
    Download the generated document for a submission.
    
    Args:
        submission_id: The submission ID to download the document for
        format: File format to download - 'pdf' or 'docx' (default: docx)
    
    Returns:
        FileResponse with the requested file
    """
    from fastapi.responses import FileResponse
    
    logger.info(f"Download request for submission: {submission_id}, format: {format}")
    
    if format not in ("pdf", "docx"):
        raise HTTPException(status_code=400, detail="Invalid format. Use 'pdf' or 'docx'")
    
    # Fetch submission from Supabase to get the file path
    try:
        submission = get_submission(submission_id)
    except Exception as e:
        logger.error(f"Failed to fetch submission: {e}")
        raise HTTPException(status_code=404, detail=f"Submission not found: {e}")
    
    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
    
    outputs = submission.get("outputs", {})
    docx_path = outputs.get("docx_path")
    pdf_path = outputs.get("pdf_path")
    
    # Select file based on format
    if format == "pdf":
        file_path = pdf_path
        media_type = "application/pdf"
        extension = "pdf"
    else:
        file_path = docx_path
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        extension = "docx"
    
    if not file_path:
        raise HTTPException(status_code=404, detail=f"{format.upper()} not available")
    
    if not os.path.exists(file_path):
        logger.error(f"File not found on disk: {file_path}")
        raise HTTPException(status_code=404, detail="Document file not found")
    
    # Get product for filename
    product = submission.get("product", "Document")
    filename = f"{product}-{submission_id[:8]}.{extension}"
    
    logger.info(f"Serving file: {file_path} as {filename}")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
