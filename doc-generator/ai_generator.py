"""
AI Content Generator for CPP Documents.
Uses Google Gemini to generate technical content based on task description.
"""

import os
import json
import logging

logger = logging.getLogger(__name__)

# System prompt for CPP document generation - REFINED with Yellow + Blue sections
CPP_SYSTEM_PROMPT = """You are an expert UK Principal Contractor and CDM 2015 Specialist.

Your task is to generate data for a Construction Phase Plan (CPP) based on a specific project activity.

INPUT:
You will receive a project activity description (e.g., "Excavation", "Office Fit-out", "Facade Replacement").
Additional context may include project title, duration, site context, and user-indicated work types.

OUTPUT FORMAT:
Return ONLY a strictly formatted JSON object. Do not include markdown formatting, code fences, or conversational text.
The JSON must contain the EXACT keys and structure shown below (placeholders/keys must match exactly).

IMPORTANT VALIDATION RULES:
- Return valid JSON only.
- All boolean values must be real JSON booleans: true or false (NOT strings like "true"/"false", NOT "true/false").
- Do not invent specific equipment, permits, stakeholders, quantities, or site constraints unless clearly implied by the input.
- If details are unknown, write professional generic wording rather than guessing specifics.
- Keep each line item short and practical (avoid long paragraphs inside the multi-line lists).

JSON STRUCTURE & INSTRUCTIONS:
{
  "yellow_section_2_scope": "(String) Write a professional 'Scope & Purpose' description (approx. 150 words). Summarize the works, identifying key inclusions and exclusions. Use UK English and CDM 2015 terminology. Do not invent project-specific facts.",

  "yellow_section_3_worklist": "(String) Write a list of main work items/packages for Section 3 (Inclusions). Each item on a new line. DO NOT include numbers or bullet points - just the text. Example format: 'Demolition and strip-out\\nStructural alterations\\nM&E first fix'. Ensure items reflect the activity type and are not generic filler.",

  "yellow_section_6_sequence": "(String) Write a 'Construction Method & Sequence' (High Level). Include 6-10 logical milestones for the project type. Each step on a NEW LINE with a NUMBER PREFIX (e.g., '1. Site setup and mobilisation', '2. Demolition phase', '3. Structural works'). Ensure sequence is realistic and ordered.",

  "yellow_section_7_risks": "(String) Generate a 'Risk Management & Controls' section with 8-12 risk topics. CRITICAL FORMATTING RULES: 1) Each topic has ONE subheader on its OWN line (e.g., '7.1 WORKING AT HEIGHT'). 2) Immediately after each subheader, list 3-5 control measures - each on its OWN separate line. 3) NO bullet symbols (no •, -, *). 4) NO punctuation at end of subheaders. 5) Separate each topic block with a blank line. EXACT FORMAT EXAMPLE:\\n7.1 WORKING AT HEIGHT\\nWeekly scaffold inspections by competent person with tagging system.\\nEdge protection installed before roof work commences.\\nMEWP operators to hold valid IPAF certification.\\n\\n7.2 LIFTING OPERATIONS\\nAppointed Person to produce lift plans for all non-routine lifts.\\nCranes inspected under LOLER with certificates on file.\\nExclusion zones established and banksmen deployed.\\n\\n7.3 TEMPORARY WORKS\\nTemporary Works Coordinator appointed before works commence.\\nDesign check certificates obtained for all propping schemes.\\n\\nGenerate topics relevant to the activity from: Working at Height, Lifting Operations, Temporary Works, Fire Safety, Services & Excavations, COSHH, Noise/Vibration/Dust, Public Protection, Manual Handling, Confined Spaces, Weather Risks, Occupational Health. Use UK CDM 2015 terminology. Each control measure must be specific and actionable.\",

  "blue_logic_flags": {
    "include_competence_plant_height": true/false,
    "include_heavy_logistics_laydown": true/false,
    "include_public_traffic_mgmt": true/false,
    "include_secure_perimeter_hoarding": true/false,
    "include_section_16_facade": true/false,
    "include_section_17_commissioning": true/false
  }
}

BLUE FLAG DECISION RULES (apply conservatively; only set TRUE when likely):
1. "include_competence_plant_height":
   TRUE if the activity commonly involves work at height (e.g., roof, facade, steel erection) OR heavy plant/mechanical handling (e.g., excavation, demolition, lifting operations, MEWPs).
   FALSE for low-risk internal works like painting, minor joinery, small office fit-out without height/plant.

2. "include_heavy_logistics_laydown":
   TRUE if cranes/hoists/laydown areas/material storage/fuel stores are likely needed (large refurb, structural works, facade systems, major deliveries).
   FALSE for small internal works with normal van deliveries and limited materials.

3. "include_public_traffic_mgmt":
   TRUE if the activity is likely to affect public roads/footways (street-facing facade, external works in public realm, deliveries requiring road closure/TTRO).
   FALSE for internal-only works or contained sites with no public interface.

4. "include_secure_perimeter_hoarding":
   TRUE if external boundary control is likely needed (open external site, public adjacent area, external compound, hoarding/CCTV/access gates).
   FALSE for internal-only works inside an existing building with controlled access.

5. "include_section_16_facade":
   TRUE if external access systems are likely (scaffolding, mast climbers, cladding, curtain wall, glazing replacement, facade repair).
   FALSE for internal refurbishment not affecting facade.

6. "include_section_17_commissioning":
   TRUE if M&E systems commissioning is likely (HVAC, fire alarm, BMS, sprinkler, electrical distribution changes, plant commissioning).
   FALSE for works that do not involve commissioning of building services.

CONSISTENCY CHECK BEFORE YOU OUTPUT:
- If include_section_16_facade is TRUE, then include_competence_plant_height is usually TRUE as well (working at height). Only set FALSE if you have a clear reason.
- If include_section_17_commissioning is TRUE, ensure the worklist/sequence mentions installation/testing/commissioning steps at a high level (without inventing brands or exact systems).
- If include_public_traffic_mgmt is TRUE, ensure risks mention pedestrian/vehicle interface and controls (segregation, signage, banksman) in generic terms.
- If a flag is FALSE, do not force related content into the yellow sections.

CONSTRAINTS:
- Use UK English and CDM 2015 terminology throughout.
- Ensure response is valid JSON only.
- Keep the EXACT JSON key names shown above (these are required placeholders for the existing tool).
"""


def generate_cpp_ai_content(task_activity: str) -> dict:
    """
    Call OpenRouter API to generate AI content for CPP document.
    
    Args:
        task_activity: The CPP_TASK_ACTIVITY text from the form.
    
    Returns:
        Dict with:
        - Yellow section placeholders: AI_SCOPE_NARRATIVE, AI_CONSTRUCTION_SEQUENCE, AI_RISK_MANAGEMENT
        - Blue logic flags: BLUE_FLAG_* for conditional section removal
    """
    # Check for API key
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("OPENROUTER_API_KEY not set, returning empty AI content")
        return _empty_ai_content()
    
    if not task_activity or not task_activity.strip():
        logger.warning("No task_activity provided, returning empty AI content")
        return _empty_ai_content()
    
    try:
        # Import here to avoid startup errors if library not installed
        from openai import OpenAI
        
        # OpenRouter uses OpenAI-compatible API
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        # Combine system prompt and user input (some models don't support system role)
        combined_prompt = f"{CPP_SYSTEM_PROMPT}\n\nPROJECT DESCRIPTION:\n{task_activity}"
        
        logger.info("Calling OpenRouter API for CPP AI content...")
        response = client.chat.completions.create(
            model="google/gemma-3-4b-it:free",  # Free tier model
            messages=[
                {"role": "user", "content": combined_prompt}
            ],
            temperature=0.7,
        )
        
        # Parse JSON from response
        response_text = response.choices[0].message.content.strip()
        
        # Handle potential markdown code fences
        if response_text.startswith("```"):
            # Remove opening fence
            lines = response_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            # Remove closing fence
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            response_text = "\n".join(lines)
        
        ai_content = json.loads(response_text)
        
        logger.info("AI content generated successfully")
        
        # Extract blue logic flags
        blue = ai_content.get("blue_logic_flags", {})
        
        # Build the result dict with template placeholders
        result = {
            # Yellow sections - fully AI generated narrative content (flat keys)
            "AI_SCOPE_NARRATIVE": ai_content.get("yellow_section_2_scope", ""),
            "AI_WORK_LIST": ai_content.get("yellow_section_3_worklist", ""),
            "AI_CONSTRUCTION_SEQUENCE": ai_content.get("yellow_section_6_sequence", ""),
            "AI_RISK_MANAGEMENT": ai_content.get("yellow_section_7_risks", ""),
            
            # Blue logic flags - for conditional removal of template sections
            # These will be used by generator.py to remove sections when FALSE
            "BLUE_FLAG_COMPETENCE_PLANT_HEIGHT": blue.get("include_competence_plant_height", True),
            "BLUE_FLAG_HEAVY_LOGISTICS_LAYDOWN": blue.get("include_heavy_logistics_laydown", True),
            "BLUE_FLAG_PUBLIC_TRAFFIC_MGMT": blue.get("include_public_traffic_mgmt", True),
            "BLUE_FLAG_SECURE_PERIMETER_HOARDING": blue.get("include_secure_perimeter_hoarding", True),
            "BLUE_FLAG_SECTION_16_FACADE": blue.get("include_section_16_facade", True),
            "BLUE_FLAG_SECTION_17_COMMISSIONING": blue.get("include_section_17_commissioning", True),
        }
        
        logger.info(f"Yellow sections extracted: scope={bool(result['AI_SCOPE_NARRATIVE'])}, worklist={bool(result['AI_WORK_LIST'])}, seq={bool(result['AI_CONSTRUCTION_SEQUENCE'])}, risk={bool(result['AI_RISK_MANAGEMENT'])}")
        logger.info(f"Blue flags: {blue}")
        
        return result
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}")
        logger.error(f"Raw response: {response_text[:500]}...")
        return _empty_ai_content()
    except Exception as e:
        logger.error(f"Failed to generate AI content: {e}")
        return _empty_ai_content()


def _empty_ai_content() -> dict:
    """Return empty AI content structure for CPP with default blue flags (all True = keep all sections)."""
    return {
        # Yellow sections - empty
        "AI_SCOPE_NARRATIVE": "",
        "AI_CONSTRUCTION_SEQUENCE": "",
        "AI_RISK_MANAGEMENT": "",
        
        # Blue flags - default to True (keep all sections when AI fails)
        "BLUE_FLAG_COMPETENCE_PLANT_HEIGHT": True,
        "BLUE_FLAG_HEAVY_LOGISTICS_LAYDOWN": True,
        "BLUE_FLAG_PUBLIC_TRAFFIC_MGMT": True,
        "BLUE_FLAG_SECURE_PERIMETER_HOARDING": True,
        "BLUE_FLAG_SECTION_16_FACADE": True,
        "BLUE_FLAG_SECTION_17_COMMISSIONING": True,
    }


# ============================================================================
# RAMS AI Content Generation
# ============================================================================

RAMS_SYSTEM_PROMPT = """You are an expert UK Health & Safety Technical Writer specialising in professional Method Statements and Risk Assessments.

INPUT: You will be provided with a RAMS task title/description (e.g., excavation, waste management, roof construction, lifting operations).

TASK: Generate comprehensive content for a professional Risk Assessment and Method Statement (RAMS).

OUTPUT: Return a valid JSON object with the following fields:

1. AI_SEQUENCE_OF_WORKS: A comprehensive and expanded sequence of works including plant, equipment and materials. The sequence must be detailed enough for a professional method statement, broken down into clear stages (10-20 steps). Each step on a NEW LINE. DO NOT include numbers - just the step text. Example format:
'Establish site welfare facilities and secure work area with barriers\\nConduct pre-start briefing covering task hazards and emergency procedures\\nVerify all operatives hold valid CSCS cards and task-specific competencies'

2. AI_RISK_ASSESSMENT: A comprehensive risk assessment table covering 8-14 reasonably foreseeable hazards.

TABLE FORMAT RULES (MUST FOLLOW EXACTLY):
- FIRST ROW MUST BE THE HEADER: Activity|Hazard|Persons at Risk|Control Measures|Residual Risk
- Each data row MUST have exactly 5 columns separated by pipe | characters
- Rows MUST be separated by newline \\n
- Each row MUST contain exactly 4 pipe characters (creating 5 cells)
- Control Measures MUST be semicolon-separated items within one cell
- Residual Risk MUST be in format: Low (2x2=4), Medium (3x3=9), High (4x4=16)

EXAMPLE AI_RISK_ASSESSMENT VALUE (FOLLOW THIS FORMAT EXACTLY):
'Activity|Hazard|Persons at Risk|Control Measures|Residual Risk\\nExcavation works|Collapse of excavation walls|Operatives, Site personnel|Shoring installed as per design; Daily inspections before entry; Edge protection installed|Low (2x2=4)\\nManual handling|Musculoskeletal injuries|Operatives|Mechanical aids used where possible; Team lifting for heavy items; Regular breaks|Low (2x3=6)\\nWorking at height|Falls from height|Operatives|Edge protection; Harness and lanyard; Trained personnel only|Medium (2x4=8)'

CONSTRAINTS:
- Use UK English and UK legislation terms (CDM 2015, LOLER 1998, PUWER 1998, Work at Height Regulations 2005).
- Risk ratings use Likelihood × Severity format (e.g., 2×3=6).
- Content must be detailed enough for professional site documentation.
- Ensure the response is VALID JSON with no conversational text.
- Do not wrap the JSON in markdown code fences.
- AI_RISK_ASSESSMENT MUST always be a properly formatted pipe-separated table string.
"""



def _sanitize_pipe_table(text: str, min_rows: int = 1, max_rows: int = 14) -> str:
    """
    Keep ONLY valid pipe rows (5 columns / 4 pipes).
    Remove header row if present. Return newline-joined rows.
    If no valid rows found, return the raw text as fallback.
    """
    if not text or not text.strip():
        logger.warning("_sanitize_pipe_table: received empty input")
        return ""

    logger.info(f"_sanitize_pipe_table: input length={len(text)}, first 200 chars: {text[:200]}")
    
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    cleaned = []

    for ln in lines:
        # Skip markdown-like table lines
        if ln.startswith("|") and ln.endswith("|"):
            ln = ln.strip("|").strip()

        # Must contain exactly 4 pipes = 5 columns
        if ln.count("|") != 4:
            logger.debug(f"Skipping row with {ln.count('|')} pipes (need 4)")
            continue

        parts = [p.strip() for p in ln.split("|")]
        if len(parts) != 5:
            continue

        # Skip header if model included it
        header = [p.lower() for p in parts]
        if header[0] == "activity" and header[1] == "hazard":
            logger.debug("Skipping header row")
            continue

        cleaned.append("|".join(parts))

        if len(cleaned) >= max_rows:
            break

    if len(cleaned) >= min_rows:
        logger.info(f"_sanitize_pipe_table: extracted {len(cleaned)} valid rows")
        return "\n".join(cleaned)
    else:
        # No valid pipe rows found - return raw text as fallback
        # This ensures data is always returned (even if not table-formatted)
        logger.warning(f"_sanitize_pipe_table: only {len(cleaned)} valid rows, returning raw text as fallback")
        return text.strip()


def generate_rams_ai_content(rams_title: str) -> dict:
    """
    Call OpenRouter API to generate AI content for RAMS document.
    Uses the same API approach as CPP for consistency.
    
    Args:
        rams_title: The RAMS_TITLE text from the form (describes the task).
    
    Returns:
        Dict with AI_SEQUENCE_OF_WORKS, AI_RISK_ASSESSMENT
    """
    # Check for API key - use same key as CPP
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("OPENROUTER_API_KEY not set, returning empty RAMS AI content")
        return _empty_rams_ai_content()
    
    if not rams_title or not rams_title.strip():
        logger.warning("No rams_title provided, returning empty RAMS AI content")
        return _empty_rams_ai_content()
    
    try:
        # Import here to avoid startup errors if library not installed
        from openai import OpenAI
        
        # OpenRouter uses OpenAI-compatible API
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        # Combine system prompt and user input (same approach as CPP)
        combined_prompt = f"{RAMS_SYSTEM_PROMPT}\n\nRAMS TASK DESCRIPTION:\n{rams_title}"
        
        logger.info("Calling OpenRouter API for RAMS AI content...")
        response = client.chat.completions.create(
            model="google/gemma-3-4b-it:free",  # Free tier model, same as CPP
            messages=[
                {"role": "user", "content": combined_prompt}
            ],
            temperature=0.7,
        )
        
        # Parse JSON from response
        response_text = response.choices[0].message.content.strip()
        
        # Handle potential markdown code fences
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            response_text = "\n".join(lines)
        
        ai_content = json.loads(response_text)
        
        # Sanitize the risk assessment table
        risk_raw = ai_content.get("AI_RISK_ASSESSMENT", "")
        risk_clean = _sanitize_pipe_table(risk_raw, min_rows=8, max_rows=14)
        
        logger.info(f"RAMS AI content generated. Risk table: {len(risk_clean.splitlines()) if risk_clean else 0} valid rows")
        return {
            "AI_SEQUENCE_OF_WORKS": ai_content.get("AI_SEQUENCE_OF_WORKS", ""),
            "AI_RISK_ASSESSMENT": risk_clean
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse RAMS AI response as JSON: {e}")
        logger.error(f"Raw response: {response_text[:500] if response_text else 'empty'}...")
        return _empty_rams_ai_content()
    except Exception as e:
        logger.error(f"Failed to generate RAMS AI content: {e}")
        return _empty_rams_ai_content()


def _empty_rams_ai_content() -> dict:
    """Return empty AI content structure for RAMS."""
    return {
        "AI_SEQUENCE_OF_WORKS": "",
        "AI_RISK_ASSESSMENT": ""
    }
