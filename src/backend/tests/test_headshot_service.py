from types import SimpleNamespace
from unittest.mock import patch

from src.backend.services import headshot_service
from src.backend.services.headshot_service import resolve_headshot_url

URL = "https://media.api-sports.io/american-football/players/1.png"


def _fetch_returning(content):
    return lambda url, timeout: SimpleNamespace(
        content=content, raise_for_status=lambda: None
    )


def _fetch_raising(url, timeout):
    raise TimeoutError("boom")


def test_placeholder_image_resolves_to_none():
    placeholder = b"placeholder-bytes"
    with patch.object(
        headshot_service,
        "is_placeholder_headshot",
        lambda content: content == placeholder,
    ):
        assert resolve_headshot_url(URL, fetch=_fetch_returning(placeholder)) is None


def test_real_image_keeps_url():
    assert resolve_headshot_url(URL, fetch=_fetch_returning(b"real-photo")) == URL


def test_failed_download_keeps_url():
    assert resolve_headshot_url(URL, fetch=_fetch_raising) == URL


def test_missing_url_stays_none():
    assert resolve_headshot_url(None, fetch=_fetch_raising) is None


def test_is_placeholder_headshot_matches_known_hash():
    import hashlib

    content = b"x"
    with patch.object(
        headshot_service,
        "PLACEHOLDER_HEADSHOT_SHA256",
        hashlib.sha256(content).hexdigest(),
    ):
        assert headshot_service.is_placeholder_headshot(content)
        assert not headshot_service.is_placeholder_headshot(b"y")
