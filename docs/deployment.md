# Bayora Production Deployment Guide

## 1. Prerequisites
- Any standard Linux VM (Ubuntu 22.04 LTS or Debian 12 recommended)
- Docker Engine 24.0+ & Docker Compose v2.20+
- Minimum Specs: 4 vCPUs, 8 GB RAM, 50 GB SSD

---

## 2. Kernel & OS Hardening (Production VM Setup)

Before booting containers, apply standard Linux sysctl hardening parameters:

```bash
# Disable unprivileged user namespace cloning if not using rootless dockerd
sudo sysctl -w kernel.unprivileged_userns_clone=1

# Disable core dumps to prevent memory exfiltration
sudo sysctl -w fs.suid_dumpable=0

# Enable strict TCP SYN cookies and RFC 1337 TIME_WAIT protection
sudo sysctl -w net.ipv4.tcp_syncookies=1
sudo sysctl -w net.ipv4.tcp_rfc1337=1

# Restrict dmesg access
sudo sysctl -w kernel.dmesg_restrict=1
```

---

## 3. Deployment with Docker Compose

1. Clone repository and verify seccomp profile:
```bash
git clone https://github.com/bayora/bayora.git
cd bayora
```

2. Boot the full isolated multi-tenant cluster:
```bash
cd infra
docker compose up -d --build
```

3. Verify running services:
```bash
docker compose ps
```
You will observe 6 isolated containers:
- `bayora-gateway`: Attached to 5 networks, enforcing policies.
- `bayora-red-sandbox`: Isolated on `bayora-red-net`.
- `bayora-blue-sandbox`: Isolated on `bayora-blue-net`.
- `bayora-model-sandbox`: Isolated on `bayora-model-net`.
- `bayora-control-plane`: FastAPI API on `bayora-control-net` & `bayora-audit-net`.
- `bayora-web-console`: Next.js web console on `http://localhost:3000`.

---

## 4. Running the Automated Test Suite

Run all isolation, sealed-commit, canary contamination, and timing padding tests:
```bash
docker compose exec control-plane pytest tests -v
```

---

## 5. Third-Party Independent Run Verification

To verify a safety benchmark run independently without logging into the web UI:
```bash
./scripts/verify_run.py --run-id run-jailbreak-001 --api-url http://localhost:8000
```
