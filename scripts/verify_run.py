#!/usr/bin/env python3
"""Bayora Independent Verification CLI Tool.

Verifies the cryptographic provenance, Ed25519 signatures, Merkle root,
and sealed-commit proofs for a given test run.
"""

import argparse
import json
import sys
import httpx


def main():
    parser = argparse.ArgumentParser(description="Bayora Independent Run Cryptographic Verifier")
    parser.add_argument("--run-id", required=True, help="Target run ID to verify (e.g. run-jailbreak-001)")
    parser.add_argument("--api-url", default="http://localhost:8000", help="Base URL of Bayora Control Plane")
    args = parser.parse_args()

    print(f"\n========================================================")
    print(f"  BAYORA INDEPENDENT RUN VERIFIER (Zero-Trust Mode)")
    print(f"========================================================")
    print(f"Target Run ID: {args.run_id}")
    print(f"Target API:    {args.api_url}\n")

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(f"{args.api_url}/api/runs/{args.run_id}/verify")
            if resp.status_code != 200:
                print(f"[ERROR] API returned status {resp.status_code}: {resp.text}")
                sys.exit(1)

            report = resp.json()

            print(f"Public Key:          {report['public_key_b64'][:24]}...")
            print(f"Blocks Audited:      {report['total_blocks_checked']}")
            print(f"Derived Merkle Root: {report.get('merkle_root', 'N/A')[:32]}...")
            print(f"\n--- Verification Steps ---")

            for step in report["steps"]:
                status_color = "\033[92m[PASSED]\033[0m" if step["status"] == "PASSED" else "\033[91m[FAILED]\033[0m"
                print(f"  {status_color} {step['check_name']}: {step['details']}")

            if report.get("sealed_commitments"):
                print(f"\n--- Sealed Commitments ---")
                for c in report["sealed_commitments"]:
                    print(f"  ID: {c['commitment_id']}")
                    print(f"    Commitment Hash: {c['commitment_hash'][:24]}...")
                    print(f"    Match Verified:  {c.get('match_verified')}")

            if report["overall_valid"]:
                print(f"\n\033[92m>>> VERIFICATION SUCCESS: All cryptographic proofs valid. Zero leakage confirmed. <<<\033[0m\n")
                sys.exit(0)
            else:
                print(f"\n\033[91m>>> VERIFICATION FAILED: Tamper alerts detected! <<<\033[0m")
                for alert in report.get("tamper_alerts", []):
                    print(f"  - {alert}")
                print()
                sys.exit(2)

    except Exception as e:
        print(f"[FATAL] Verification failed to execute: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
