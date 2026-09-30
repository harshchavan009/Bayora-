const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Authentication failed");
  }
  return res.json();
}

export async function apiSignup(name: string, email: string, password: string, workspace_name: string) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password, workspace_name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(err.detail || "Signup failed");
  }
  return res.json();
}

export async function apiLogout() {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function apiGetMe() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function apiGetMembers() {
  const res = await fetch(`${API_BASE}/api/auth/members`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch team members");
  return res.json();
}

export async function apiInviteMember(email: string, role: string) {
  const res = await fetch(`${API_BASE}/api/auth/invitations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) throw new Error("Failed to send invitation");
  return res.json();
}

export async function apiGenerateKey(name: string, scopes: string[]) {
  const res = await fetch(`${API_BASE}/api/auth/keys/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, scopes }),
  });
  if (!res.ok) throw new Error("Failed to generate API key");
  return res.json();
}

export async function apiGetKeys() {
  const res = await fetch(`${API_BASE}/api/auth/keys`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch API keys");
  return res.json();
}
