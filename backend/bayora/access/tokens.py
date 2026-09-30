"""Capability-based scoped tokens for Bayora access control."""

import base64
import hashlib
import hmac
import json
import os
import time
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

SECRET_TMPFS_PATH = "/run/secrets/bayora_token_secret.key"
_DEFAULT_IN_MEMORY_SECRET = os.urandom(32)


def get_signing_secret() -> bytes:
    """Reads secret from mounted tmpfs if available, otherwise uses secure memory secret."""
    if os.path.exists(SECRET_TMPFS_PATH):
        try:
            with open(SECRET_TMPFS_PATH, "rb") as f:
                content = f.read().strip()
                if content:
                    return content
        except Exception:
            pass
    return _DEFAULT_IN_MEMORY_SECRET


class CapabilityToken(BaseModel):
    sub: str
    tenant: str  # "red", "blue", "model", "auditor", "admin"
    role: str    # "red_operator", "blue_operator", "auditor", "admin"
    scopes: List[str]
    run_id: Optional[str] = None
    iat: float = Field(default_factory=time.time)
    exp: float
    jti: str  # unique token ID


def issue_token(
    sub: str,
    tenant: str,
    role: str,
    scopes: List[str],
    run_id: Optional[str] = None,
    ttl_seconds: int = 3600,
    secret: Optional[bytes] = None
) -> str:
    """Issues a cryptographically signed capability token."""
    key = secret or get_signing_secret()
    now = time.time()
    token_id = os.urandom(16).hex()

    payload = {
        "sub": sub,
        "tenant": tenant,
        "role": role,
        "scopes": scopes,
        "run_id": run_id,
        "iat": now,
        "exp": now + ttl_seconds,
        "jti": token_id
    }

    serialized = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    b64_payload = base64.urlsafe_b64encode(serialized).decode("ascii").rstrip("=")
    signature = hmac.new(key, b64_payload.encode("ascii"), hashlib.sha256).digest()
    b64_sig = base64.urlsafe_b64encode(signature).decode("ascii").rstrip("=")

    return f"bayora.{b64_payload}.{b64_sig}"


def verify_token(raw_token: str, required_scope: Optional[str] = None, secret: Optional[bytes] = None) -> Tuple[bool, Optional[CapabilityToken], Optional[str]]:
    """Verifies signature, expiration, and required scope for a capability token."""
    key = secret or get_signing_secret()
    parts = raw_token.split(".")
    if len(parts) != 3 or parts[0] != "bayora":
        return False, None, "Invalid token format prefix"

    b64_payload, b64_sig = parts[1], parts[2]

    # Verify signature
    computed_sig = hmac.new(key, b64_payload.encode("ascii"), hashlib.sha256).digest()
    expected_b64_sig = base64.urlsafe_b64encode(computed_sig).decode("ascii").rstrip("=")
    if not hmac.compare_digest(b64_sig, expected_b64_sig):
        return False, None, "Cryptographic token signature mismatch"

    # Decode payload
    try:
        padding = "=" * ((4 - len(b64_payload) % 4) % 4)
        payload_bytes = base64.urlsafe_b64decode(b64_payload + padding)
        data = json.loads(payload_bytes.decode("utf-8"))
        token = CapabilityToken(**data)
    except Exception as e:
        return False, None, f"Failed to parse token payload: {str(e)}"

    # Check expiration
    if time.time() > token.exp:
        return False, None, f"Token expired at {token.exp}"

    # Check required scope
    if required_scope and required_scope not in token.scopes and "admin:all" not in token.scopes:
        return False, token, f"Forbidden: token lacks scope '{required_scope}'"

    return True, token, None
