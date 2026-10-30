import hashlib

import requests

from src.backend.core.headshot_config import (
    HEADSHOT_FETCH_TIMEOUT_SECONDS,
    PLACEHOLDER_HEADSHOT_SHA256,
)
from src.backend.utils.logging import setup_logger

logger = setup_logger()


def is_placeholder_headshot(image_bytes):
    return hashlib.sha256(image_bytes).hexdigest() == PLACEHOLDER_HEADSHOT_SHA256


def resolve_headshot_url(image_url, fetch=requests.get):
    """Return image_url, or None if it points at the API's Placeholder Headshot.

    If the image can't be downloaded, the URL is kept as-is so a transient
    network error doesn't erase a possibly valid photo; the next ETL run
    re-checks it.
    """
    if not image_url:
        return None

    try:
        response = fetch(image_url, timeout=HEADSHOT_FETCH_TIMEOUT_SECONDS)
        response.raise_for_status()
    except Exception as e:
        logger.warning(f"Could not check headshot {image_url}, keeping URL: {e}")
        return image_url

    if is_placeholder_headshot(response.content):
        return None
    return image_url
