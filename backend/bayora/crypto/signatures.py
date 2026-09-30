"""Ed25519 signature primitives for Bayora cryptographic provenance."""

import base64
from typing import Tuple
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization


def generate_keypair() -> Tuple[ed25519.Ed25519PrivateKey, ed25519.Ed25519PublicKey]:
    """Generates an in-memory Ed25519 private/public keypair."""
    private_key = ed25519.Ed25519PrivateKey.generate()
    return private_key, private_key.public_key()


def export_public_key_b64(public_key: ed25519.Ed25519PublicKey) -> str:
    """Exports raw public key bytes encoded in base64."""
    raw_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw
    )
    return base64.b64encode(raw_bytes).decode("ascii")


def load_public_key_b64(b64_str: str) -> ed25519.Ed25519PublicKey:
    """Loads an Ed25519 public key from base64 string."""
    raw_bytes = base64.b64decode(b64_str)
    return ed25519.Ed25519PublicKey.from_public_bytes(raw_bytes)


def sign_message(private_key: ed25519.Ed25519PrivateKey, message: bytes) -> str:
    """Signs message bytes and returns base64 encoded signature."""
    sig = private_key.sign(message)
    return base64.b64encode(sig).decode("ascii")


def verify_signature(public_key: ed25519.Ed25519PublicKey, message: bytes, b64_signature: str) -> bool:
    """Verifies an Ed25519 signature against message bytes."""
    try:
        sig_bytes = base64.b64decode(b64_signature)
        public_key.verify(sig_bytes, message)
        return True
    except Exception:
        return False
