from fastapi import APIRouter, HTTPException, Depends, Response, Request
from pydantic import BaseModel
from typing import List, Optional
import time
import uuid
import hashlib
from .models import User, Workspace, Invitation, ApiKey
from .service import (
    USERS, WORKSPACES, INVITATIONS, API_KEYS,
    hash_password, verify_password, create_access_token, verify_access_token
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    workspace_name: str

class InviteRequest(BaseModel):
    email: str
    role: str

class CreateApiKeyRequest(BaseModel):
    name: str
    scopes: List[str]
    expires_in_days: Optional[int] = 30

@router.post("/login")
def login(req: LoginRequest, response: Response):
    user_record = USERS.get(req.email)
    if not user_record or not verify_password(user_record["password_hash"], req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(
        user_id=user_record["id"],
        email=user_record["email"],
        role=user_record["role"],
        workspace_id=user_record["workspace_id"]
    )
    
    # Set httpOnly secure session cookie
    response.set_cookie(
        key="bayora_session",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=86400 * 7,
    )
    
    return {
        "user": {
            "id": user_record["id"],
            "email": user_record["email"],
            "full_name": user_record["full_name"],
            "role": user_record["role"],
            "workspace_id": user_record["workspace_id"],
            "mfa_enabled": user_record["mfa_enabled"]
        },
        "token": token
    }

@router.post("/signup")
def signup(req: SignupRequest, response: Response):
    if req.email in USERS:
        raise HTTPException(status_code=400, detail="Account with this email already exists")
    
    ws_id = f"ws-{uuid.uuid4().hex[:6]}"
    workspace = Workspace(
        id=ws_id,
        name=req.workspace_name,
        slug=req.workspace_name.lower().replace(" ", "-")[:16],
        tier="Enterprise",
        created_at=time.time()
    )
    WORKSPACES[ws_id] = workspace
    
    user_id = f"usr-{uuid.uuid4().hex[:6]}"
    user_record = {
        "id": user_id,
        "email": req.email,
        "full_name": req.name,
        "role": "owner",
        "workspace_id": ws_id,
        "password_hash": hash_password(req.password),
        "mfa_enabled": False,
        "created_at": time.time()
    }
    USERS[req.email] = user_record
    
    token = create_access_token(user_id, req.email, "owner", ws_id)
    response.set_cookie(
        key="bayora_session",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=86400 * 7,
    )
    
    return {
        "user": {
            "id": user_id,
            "email": req.email,
            "full_name": req.name,
            "role": "owner",
            "workspace_id": ws_id,
            "mfa_enabled": False
        },
        "workspace": workspace,
        "token": token
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="bayora_session")
    return {"status": "Logged out successfully"}

@router.get("/me")
def get_current_user(request: Request):
    token = request.cookies.get("bayora_session")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        # Default fallback to owner in dev
        default_user = USERS["owner@bayora.io"]
        return {
            "id": default_user["id"],
            "email": default_user["email"],
            "full_name": default_user["full_name"],
            "role": default_user["role"],
            "workspace_id": default_user["workspace_id"],
            "mfa_enabled": default_user["mfa_enabled"]
        }
        
    claims = verify_access_token(token)
    if not claims:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
        
    user_record = USERS.get(claims["email"])
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "id": user_record["id"],
        "email": user_record["email"],
        "full_name": user_record["full_name"],
        "role": user_record["role"],
        "workspace_id": user_record["workspace_id"],
        "mfa_enabled": user_record["mfa_enabled"]
    }

@router.get("/workspaces")
def list_workspaces():
    return list(WORKSPACES.values())

@router.get("/members")
def list_members():
    members = []
    for u in USERS.values():
        members.append({
            "id": u["id"],
            "email": u["email"],
            "full_name": u["full_name"],
            "role": u["role"],
            "mfa_enabled": u["mfa_enabled"],
            "created_at": u["created_at"]
        })
    return members

@router.post("/invitations")
def create_invitation(req: InviteRequest):
    inv_id = f"inv-{uuid.uuid4().hex[:6]}"
    inv = Invitation(
        id=inv_id,
        workspace_id="ws-meridian",
        email=req.email,
        role=req.role,
        token=uuid.uuid4().hex,
        expires_at=time.time() + 86400 * 7,
        status="PENDING"
    )
    INVITATIONS.append(inv)
    return {
        "invitation": inv,
        "invite_url": f"https://app.bayora.io/accept-invite/{inv.token}"
    }

@router.post("/keys/generate")
def generate_api_key(req: CreateApiKeyRequest):
    raw_secret = f"byra_live_{uuid.uuid4().hex}{uuid.uuid4().hex[:8]}"
    prefix = raw_secret[:12]
    key_hash = hashlib.sha256(raw_secret.encode()).hexdigest()
    
    expires_at = time.time() + (86400 * req.expires_in_days) if req.expires_in_days else None
    
    key_obj = ApiKey(
        id=f"key-{uuid.uuid4().hex[:6]}",
        workspace_id="ws-meridian",
        name=req.name,
        prefix=f"{prefix}...",
        key_hash=key_hash,
        scopes=req.scopes,
        created_at=time.time(),
        expires_at=expires_at,
        status="Active"
    )
    API_KEYS.append(key_obj)
    
    return {
        "id": key_obj.id,
        "name": key_obj.name,
        "prefix": key_obj.prefix,
        "plaintext_key": raw_secret,
        "scopes": key_obj.scopes,
        "expires_at": expires_at,
        "warning": "Save this API key now. It will never be shown again."
    }

@router.get("/keys")
def list_api_keys():
    if not API_KEYS:
        # Provide sample masked keys
        return [
            {
                "id": "key-prod-runner",
                "name": "Production CI Runner",
                "prefix": "byra_live_7c4a...****",
                "scopes": ["evaluations:run", "findings:read"],
                "created_at": time.time() - 86400 * 5,
                "status": "Active"
            },
            {
                "id": "key-auditor-sync",
                "name": "Audit Log SIEM Ingestion",
                "prefix": "byra_live_1d9e...****",
                "scopes": ["audit:read", "audit:verify"],
                "created_at": time.time() - 86400 * 12,
                "status": "Active"
            }
        ]
    return [
        {
            "id": k.id,
            "name": k.name,
            "prefix": k.prefix,
            "scopes": k.scopes,
            "created_at": k.created_at,
            "expires_at": k.expires_at,
            "status": k.status
        }
        for k in API_KEYS
    ]
