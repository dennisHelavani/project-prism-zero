"""
Supabase client wrapper for fetching and updating submissions.
Uses httpx for REST API calls (simpler than supabase-py for our use case).
"""

import os
import logging
from typing import Dict, Any, Optional
from pathlib import Path
import httpx

# Load .env file from the doc-generator directory
from dotenv import load_dotenv
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger(__name__)

# Environment configuration  
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')


def _get_headers() -> Dict[str, str]:
    """Get headers for Supabase REST API requests."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError(
            "Missing Supabase configuration. "
            "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
        )
    
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }


def _get_rest_url() -> str:
    """Get Supabase REST API base URL."""
    # Remove trailing slash if present
    base_url = SUPABASE_URL.rstrip('/')
    return f"{base_url}/rest/v1"


def get_submission(submission_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch a submission from Supabase by ID.
    
    Args:
        submission_id: UUID of the submission
    
    Returns:
        Submission data dict or None if not found
    
    Raises:
        Exception on API errors
    """
    url = f"{_get_rest_url()}/submissions"
    params = {
        "id": f"eq.{submission_id}",
        "select": "*"
    }
    
    logger.info(f"Fetching submission: {submission_id}")
    
    try:
        response = httpx.get(url, headers=_get_headers(), params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if not data or len(data) == 0:
            logger.warning(f"Submission not found: {submission_id}")
            return None
        
        logger.info(f"Submission fetched successfully: {submission_id}")
        return data[0]
        
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching submission: {e.response.status_code} - {e.response.text}")
        raise Exception(f"Failed to fetch submission: {e.response.status_code}")
    except Exception as e:
        logger.error(f"Error fetching submission: {e}")
        raise


def update_submission_outputs(submission_id: str, outputs: Dict[str, Any]) -> bool:
    """
    Update the outputs field of a submission.
    
    Args:
        submission_id: UUID of the submission
        outputs: Dict containing output paths and metadata
    
    Returns:
        True if update was successful
    
    Raises:
        Exception on API errors
    """
    url = f"{_get_rest_url()}/submissions"
    params = {
        "id": f"eq.{submission_id}"
    }
    
    payload = {
        "outputs": outputs
    }
    
    logger.info(f"Updating submission outputs: {submission_id}")
    logger.debug(f"Outputs: {outputs}")
    
    try:
        response = httpx.patch(url, headers=_get_headers(), params=params, json=payload, timeout=30)
        response.raise_for_status()
        
        logger.info(f"Submission outputs updated successfully: {submission_id}")
        return True
        
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error updating submission: {e.response.status_code} - {e.response.text}")
        raise Exception(f"Failed to update submission: {e.response.status_code}")
    except Exception as e:
        logger.error(f"Error updating submission: {e}")
        raise


def upload_file_to_storage(
    local_path: str,
    storage_path: str,
    bucket: str = "generated-documents",
) -> str:
    """
    Upload a local file to Supabase Storage and return its public URL.

    Args:
        local_path: Absolute path to the local file.
        storage_path: Target path inside the bucket (e.g. "submission-id/file.pdf").
        bucket: Supabase Storage bucket name (default: "generated-documents").

    Returns:
        Public URL string for the uploaded object.

    Raises:
        Exception if upload fails.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

    if not os.path.exists(local_path):
        raise FileNotFoundError(f"File not found: {local_path}")

    base_url = SUPABASE_URL.rstrip("/")
    upload_url = f"{base_url}/storage/v1/object/{bucket}/{storage_path}"

    # Determine content type
    ext = os.path.splitext(local_path)[1].lower()
    content_types = {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    content_type = content_types.get(ext, "application/octet-stream")

    file_size = os.path.getsize(local_path)
    logger.info(f"Uploading {local_path} ({file_size:,} bytes) to {bucket}/{storage_path}")

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",  # Overwrite if exists (re-runs)
    }

    try:
        with open(local_path, "rb") as f:
            response = httpx.post(upload_url, headers=headers, content=f.read(), timeout=120)

        if response.status_code not in (200, 201):
            logger.error(f"Storage upload failed ({response.status_code}): {response.text[:500]}")
            raise Exception(f"Storage upload failed: {response.status_code} - {response.text[:200]}")

        # Build public URL
        public_url = f"{base_url}/storage/v1/object/public/{bucket}/{storage_path}"
        logger.info(f"Upload complete: {public_url}")
        return public_url

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error uploading to storage: {e.response.status_code}")
        raise Exception(f"Storage upload HTTP error: {e.response.status_code}")
    except Exception as e:
        logger.error(f"Error uploading to storage: {e}")
        raise


if __name__ == "__main__":
    # Simple test
    logging.basicConfig(level=logging.INFO)
    
    print("Supabase Configuration:")
    print(f"  URL: {SUPABASE_URL[:30]}..." if SUPABASE_URL else "  URL: NOT SET")
    print(f"  Key: {'SET' if SUPABASE_SERVICE_ROLE_KEY else 'NOT SET'}")
    
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        print("\n✓ Configuration looks good!")
    else:
        print("\n✗ Missing configuration. Set environment variables:")
        print("  export SUPABASE_URL='https://xxx.supabase.co'")
        print("  export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'")

