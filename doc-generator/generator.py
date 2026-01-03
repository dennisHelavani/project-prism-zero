"""
DOCX document generator with placeholder replacement.
Handles Word's run-splitting of placeholders and optional image insertion.
"""

import os
import re
import logging
from typing import Dict, Optional
from docx import Document
from docx.shared import Inches
from docx.oxml.ns import qn

logger = logging.getLogger(__name__)


class TemplateNotFoundError(Exception):
    """Raised when template file is not found."""
    pass


def generate_docx(
    template_path: str,
    output_path: str,
    placeholders: Dict[str, str],
    images: Optional[Dict[str, str]] = None
) -> str:
    """
    Generate a DOCX document by replacing placeholders in a template.
    
    Args:
        template_path: Path to the DOCX template file
        output_path: Path where the generated DOCX will be saved
        placeholders: Dictionary of placeholder keys and their replacement values
        images: Optional dictionary of image placeholder keys and image file paths
    
    Returns:
        Path to the generated DOCX file
    
    Raises:
        TemplateNotFoundError: If template file doesn't exist
    """
    if not os.path.exists(template_path):
        raise TemplateNotFoundError(f"Template not found: {template_path}")
    
    logger.info(f"Loading template: {template_path}")
    doc = Document(template_path)
    
    images = images or {}
    
    # Process all parts of the document
    _replace_placeholders_in_paragraphs(doc.paragraphs, placeholders, images, doc)
    
    # Process tables
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                _replace_placeholders_in_paragraphs(cell.paragraphs, placeholders, images, doc)
    
    # Process headers and footers
    for section in doc.sections:
        # Header
        if section.header:
            _replace_placeholders_in_paragraphs(section.header.paragraphs, placeholders, images, doc)
            for table in section.header.tables:
                for row in table.rows:
                    for cell in row.cells:
                        _replace_placeholders_in_paragraphs(cell.paragraphs, placeholders, images, doc)
        
        # Footer
        if section.footer:
            _replace_placeholders_in_paragraphs(section.footer.paragraphs, placeholders, images, doc)
            for table in section.footer.tables:
                for row in table.rows:
                    for cell in row.cells:
                        _replace_placeholders_in_paragraphs(cell.paragraphs, placeholders, images, doc)
    
    # Process Text Boxes (shapes with text content)
    # Text boxes are stored in w:txbxContent elements
    _replace_placeholders_in_textboxes(doc, placeholders, images)
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    
    # Save the document
    logger.info(f"Saving document: {output_path}")
    doc.save(output_path)
    
    return output_path


def _replace_placeholders_in_textboxes(doc: Document, placeholders: Dict[str, str], images: Dict[str, str]):
    """
    Process text boxes (shapes with text content).
    Text boxes in DOCX are stored in w:txbxContent elements within shapes.
    This handles both VML text boxes and DrawingML text boxes.
    """
    from docx.text.paragraph import Paragraph
    
    # Find all txbxContent elements (text box content containers)
    # These can be in VML shapes (w:pict/v:shape/v:textbox/w:txbxContent)
    # or in DrawingML (w:drawing/.../wps:txbx/w:txbxContent)
    
    txbx_contents = doc.element.iter(qn('w:txbxContent'))
    
    for txbx_content in txbx_contents:
        # Find all paragraph elements inside the text box
        for p_elem in txbx_content.iter(qn('w:p')):
            try:
                # Create a Paragraph wrapper for the element
                paragraph = Paragraph(p_elem, None)
                
                # Get the text to check for placeholders
                full_text = paragraph.text
                if '{{' in full_text and '}}' in full_text:
                    logger.info(f"Found placeholder in text box: {full_text[:50]}...")
                    _replace_in_paragraph(paragraph, placeholders, images, doc)
                    
            except Exception as e:
                logger.warning(f"Error processing text box paragraph: {e}")


def _replace_placeholders_in_paragraphs(
    paragraphs,
    placeholders: Dict[str, str],
    images: Dict[str, str],
    doc: Document
):
    """
    Replace placeholders in a list of paragraphs.
    Handles Word's run-splitting of placeholders.
    Deletes paragraphs that become empty after placeholder replacement.
    """
    # Create a list of paragraphs to remove
    paragraphs_to_remove = []
    
    for paragraph in paragraphs:
        was_replaced_with_empty = _replace_in_paragraph(paragraph, placeholders, images, doc)
        
        # If a placeholder was replaced with empty string, check if paragraph is now empty
        if was_replaced_with_empty:
            # Check if the text is empty or just whitespace
            if not paragraph.text.strip():
                paragraphs_to_remove.append(paragraph)
    
    # Remove the empty paragraphs
    for p in paragraphs_to_remove:
        try:
            p._element.getparent().remove(p._element)
            logger.debug("Removed empty paragraph after placeholder replacement")
        except Exception as e:
            logger.warning(f"Failed to remove empty paragraph: {e}")


def _replace_in_paragraph(
    paragraph,
    placeholders: Dict[str, str],
    images: Dict[str, str],
    doc: Document
) -> bool:
    """
    Replace placeholders in a single paragraph.
    Uses a two-pass approach:
    1. First, merge runs that contain split placeholders
    2. Then, perform the actual replacement
    
    Returns:
        bool: True if a placeholder was replaced with an empty string (candidate for deletion)
    """
    # Get full paragraph text
    full_text = paragraph.text
    
    # Find all placeholder patterns {{KEY}}
    placeholder_pattern = r'\{\{([A-Za-z0-9_]+)\}\}'
    matches = list(re.finditer(placeholder_pattern, full_text))
    
    if not matches:
        return False  # No placeholders in this paragraph
    
    # Check if placeholders are split across runs
    # If so, we need to merge the runs first
    if len(paragraph.runs) > 1:
        _merge_placeholder_runs(paragraph)
        
    replaced_with_empty = False
    
    # Now perform replacements on each run
    for run in paragraph.runs:
        run_text = run.text
        
        # Find placeholders in this run
        for match in re.finditer(placeholder_pattern, run_text):
            placeholder_key = match.group(1)
            full_placeholder = match.group(0)  # {{KEY}}
            
            # Check if this is an image placeholder
            if placeholder_key in images and images[placeholder_key]:
                image_path = images[placeholder_key]
                if os.path.exists(image_path):
                    # Replace with image
                    logger.info(f"Inserting image for {placeholder_key}: {image_path}")
                    run.text = run_text.replace(full_placeholder, "")
                    run_text = run.text
                    try:
                        run.add_picture(image_path, width=Inches(2.0))
                    except Exception as e:
                        logger.warning(f"Failed to insert image {image_path}: {e}")
                else:
                    # Image path doesn't exist, remove placeholder
                    logger.warning(f"Image not found for {placeholder_key}: {image_path}")
                    run.text = run_text.replace(full_placeholder, "")
                    run_text = run.text
                    replaced_with_empty = True
            
            # Check if this is a text placeholder
            elif placeholder_key in placeholders:
                val = placeholders[placeholder_key]
                replacement = str(val) if val else ""
                
                if not replacement:
                    replaced_with_empty = True
                
                # SPECIAL HANDLING: Titles should be vertical (bottom-to-top)
                if placeholder_key in ["RAMS_TITLE", "CPP_PROJECT_TITLE"]:
                    _set_cell_text_direction_vertical(paragraph)
                    
                run.text = run_text.replace(full_placeholder, replacement)
                run_text = run.text
            
            # Placeholder not in data - remove it (replace with empty string)
            else:
                logger.debug(f"Placeholder not found in data: {placeholder_key}")
                run.text = run_text.replace(full_placeholder, "")
                run_text = run.text
                replaced_with_empty = True
                
    return replaced_with_empty


def _set_cell_text_direction_vertical(paragraph):
    """
    Set the text direction of the parent table cell to 'btLr' (bottom-to-top).
    Also sets vertical alignment to 'center' and paragraph alignment to 'left' (bottom anchor).
    Requires the paragraph to be inside a table cell.
    """
    try:
        # 1. Force Paragraph Alignment to LEFT (which is Bottom for vertical text)
        from docx.enum.text import WD_ALIGN_PARAGRAPH
        paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
        
        # Access the underlying OpenXML element
        p_element = paragraph._element
        
        # Traverse up to find the Table Cell (tc) element
        current = p_element
        while current is not None:
            if current.tag.endswith('tc'): # w:tc
                 tc = current
                 tcPr = tc.get_or_add_tcPr()
                 
                 # 2. Set Text Direction: btLr (bottom to top, left to right)
                 # This rotates text 90deg CCW. Bottom of letter faces East.
                 text_direction = qn('w:textDirection')
                 matches = tcPr.xpath('w:textDirection')
                 if matches:
                     matches[0].set(qn('w:val'), 'btLr')
                 else:
                     elem = OxmlElement('w:textDirection')
                     elem.set(qn('w:val'), 'btLr')
                     tcPr.append(elem)
                 
                 # 3. Set Vertical Alignment: Center
                 v_align = qn('w:vAlign')
                 matches_va = tcPr.xpath('w:vAlign')
                 if matches_va:
                     matches_va[0].set(qn('w:val'), 'center')
                 else:
                     elem_va = OxmlElement('w:vAlign')
                     elem_va.set(qn('w:val'), 'center')
                     tcPr.append(elem_va)
                     
                 logger.info("Applied vertical text direction (btLr) + center align to table cell")
                 return
            current = current.getparent()
            
        logger.warning("Could not find parent Table Cell for vertical title - make sure it's in a table!")
            
    except Exception as e:
        logger.warning(f"Failed to set vertical text direction: {e}")


def OxmlElement(tag):
    """Helper to create OXML element"""
    from docx.oxml.ns import nsmap
    from lxml import etree
    return etree.Element(qn(tag), nsmap=nsmap)


def _merge_placeholder_runs(paragraph):
    """
    Merge runs that contain split placeholders.

    
    Word sometimes splits text like "{{KEY}}" into multiple runs:
    Run 1: "{{"
    Run 2: "KEY"
    Run 3: "}}"
    
    This function detects and merges such split placeholders.
    """
    if not paragraph.runs:
        return
    
    # Get full paragraph text and check for placeholders
    full_text = paragraph.text
    if "{{" not in full_text or "}}" not in full_text:
        return
    
    # Find positions of {{ and }} in the text
    open_pos = []
    close_pos = []
    
    i = 0
    while i < len(full_text) - 1:
        if full_text[i:i+2] == "{{":
            open_pos.append(i)
            i += 2
        elif full_text[i:i+2] == "}}":
            close_pos.append(i)
            i += 2
        else:
            i += 1
    
    if not open_pos or not close_pos:
        return
    
    # Build a map of character positions to runs
    char_to_run = []
    for run_idx, run in enumerate(paragraph.runs):
        for _ in range(len(run.text)):
            char_to_run.append(run_idx)
    
    # Check each placeholder span
    for op in open_pos:
        # Find matching close
        matching_close = None
        for cp in close_pos:
            if cp > op:
                matching_close = cp
                break
        
        if matching_close is None:
            continue
        
        # Check if placeholder spans multiple runs
        if len(char_to_run) <= matching_close + 1:
            continue
            
        start_run = char_to_run[op] if op < len(char_to_run) else -1
        end_run = char_to_run[matching_close + 1] if matching_close + 1 < len(char_to_run) else char_to_run[-1]
        
        if start_run != end_run and start_run >= 0:
            # Placeholder is split - merge all text into first run
            # This is a simplified approach: merge all runs into one
            merged_text = full_text
            
            # Clear all runs except first
            first_run = paragraph.runs[0]
            first_run.text = merged_text
            
            # Remove other runs (by clearing their text)
            for run in paragraph.runs[1:]:
                run.text = ""
            
            # Only need to do this once per paragraph
            return
