from pydantic import BaseModel, EmailStr
from typing import List, Optional
import time

class User(BaseModel):
    id: str
    email: str
    full_name: str
    role: str # owner, admin, red_lead, red_operator, blue_lead, blue_engineer, auditor, viewer
    workspace_id: str
    mfa_enabled: bool = False
    created_at: float = time.time()

class Workspace(BaseModel):
    id: str
    name: str
    slug: str
    tier: str = "Enterprise"
    created_at: float = time.time()

class Invitation(BaseModel):
    id: str
    workspace_id: str
    email: str
    role: str
    token: str
    expires_at: float
    status: str = "PENDING" # PENDING, ACCEPTED, REVOKED

class ApiKey(BaseModel):
    id: str
    workspace_id: str
    name: str
    prefix: str
    key_hash: str
    scopes: List[str]
    created_at: float = time.time()
    expires_at: Optional[float] = None
    status: str = "Active"
