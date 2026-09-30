import time
import uuid
import hmac
import hashlib
import json
import base64
from typing import Dict, List, Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from .models import User, Workspace, Invitation, ApiKey

ph = PasswordHasher()
SECRET_KEY = "bayora-production-jwt-auth-secret-change-in-prod"

# In-memory stores
WORKSPACES: Dict[str, Workspace] = {
    "ws-meridian": Workspace(
        id="ws-meridian",
        name="Meridian Safety Labs",
        slug="meridian-prod",
        tier="Enterprise",
        created_at=time.time() - 86400 * 30
    ),
    "ws-anthos": Workspace(
        id="ws-anthos",
        name="Anthos Red Team",
        slug="anthos-staging",
        tier="Team",
        created_at=time.time() - 86400 * 10
    )
}

USERS: Dict[str, dict] = {}
INVITATIONS: List[Invitation] = []
API_KEYS: List[ApiKey] = []

def init_seed_users():
    """Initializes seeded enterprise accounts with documented demo passwords."""
    seed_credentials = [
        ("owner@bayora.io", "Harsh Chavan", "owner", "ws-meridian", "BayoraOwner2026!"),
        ("admin@bayora.io", "Security Admin", "admin", "ws-meridian", "BayoraAdmin2026!"),
        ("red@bayora.io", "Red Team Lead", "red_lead", "ws-meridian", "BayoraRed2026!"),
        ("blue@bayora.io", "Blue Defense Lead", "blue_lead", "ws-meridian", "BayoraBlue2026!"),
        ("auditor@bayora.io", "Compliance Auditor", "auditor", "ws-meridian", "BayoraAuditor2026!"),
        ("viewer@bayora.io", "Executive Viewer", "viewer", "ws-meridian", "BayoraViewer2026!"),
    ]
    for email, name, role, ws_id, pwd in seed_credentials:
        user_id = f"usr-{email.split('@')[0]}"
        pwd_hash = ph.hash(pwd)
        USERS[email] = {
            "id": user_id,
            "email": email,
            "full_name": name,
            "role": role,
            "workspace_id": ws_id,
            "password_hash": pwd_hash,
            "mfa_enabled": role in ["owner", "admin", "auditor"],
            "created_at": time.time() - 86400 * 15
        }

init_seed_users()

def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_password(hash_str: str, password: str) -> bool:
    try:
        return ph.verify(hash_str, password)
    except VerifyMismatchError:
        return False

def create_access_token(user_id: str, email: str, role: str, workspace_id: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "workspace_id": workspace_id,
        "exp": int(time.time()) + 86400 * 7, # 7 days session
        "iat": int(time.time()),
    }
    h_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    p_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signing_input = f"{h_b64}.{p_b64}"
    sig = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    return f"{signing_input}.{sig_b64}"

def verify_access_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        signing_input = f"{parts[0]}.{parts[1]}"
        expected_sig = base64.urlsafe_b64encode(
            hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
        ).decode().rstrip("=")
        if not hmac.compare_digest(parts[2], expected_sig):
            return None
        payload_data = json.loads(base64.urlsafe_b64decode(parts[1] + "==").decode())
        if payload_data.get("exp", 0) < time.time():
            return None
        return payload_data
    except Exception:
        return None
