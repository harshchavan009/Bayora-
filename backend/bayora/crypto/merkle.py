"""Merkle tree construction, root generation, and cryptographic proof verification."""

import hashlib
from typing import List, Dict, Any, Optional


def hash_pair(left: str, right: str) -> str:
    """Computes SHA-256 hash of concatenated child hashes."""
    combined = (left + right).encode("ascii")
    return hashlib.sha256(combined).hexdigest()


class MerkleNode:
    def __init__(self, hash_val: str, left=None, right=None):
        self.hash_val = hash_val
        self.left = left
        self.right = right

    def to_dict(self) -> Dict[str, Any]:
        return {
            "hash": self.hash_val,
            "left": self.left.to_dict() if self.left else None,
            "right": self.right.to_dict() if self.right else None,
        }


class MerkleTree:
    """Binary Merkle Tree for periodic checkpointing and independent audit proofs."""

    def __init__(self, leaves: List[str]):
        # Ensure at least one leaf
        self.raw_leaves = leaves if leaves else [hashlib.sha256(b"EMPTY_MERKLE_TREE").hexdigest()]
        self.leaf_nodes = [MerkleNode(h) for h in self.raw_leaves]
        self.root = self._build_tree(self.leaf_nodes)

    def _build_tree(self, nodes: List[MerkleNode]) -> MerkleNode:
        if not nodes:
            return MerkleNode(hashlib.sha256(b"").hexdigest())
        if len(nodes) == 1:
            return nodes[0]

        next_level = []
        for i in range(0, len(nodes), 2):
            left = nodes[i]
            right = nodes[i + 1] if i + 1 < len(nodes) else nodes[i]  # Duplicate odd leaf
            parent_hash = hash_pair(left.hash_val, right.hash_val)
            next_level.append(MerkleNode(parent_hash, left, right))

        return self._build_tree(next_level)

    @property
    def root_hash(self) -> str:
        return self.root.hash_val

    def get_proof(self, leaf_index: int) -> List[Dict[str, str]]:
        """Generates an audit path proof for the leaf at `leaf_index`."""
        if leaf_index < 0 or leaf_index >= len(self.raw_leaves):
            raise IndexError("Leaf index out of range")

        proof: List[Dict[str, str]] = []
        current_nodes = [n.hash_val for n in self.leaf_nodes]
        index = leaf_index

        while len(current_nodes) > 1:
            # If odd count, duplicate last
            if len(current_nodes) % 2 != 0:
                current_nodes.append(current_nodes[-1])

            is_right_child = (index % 2 == 1)
            sibling_index = index - 1 if is_right_child else index + 1
            sibling_hash = current_nodes[sibling_index]

            proof.append({
                "position": "left" if is_right_child else "right",
                "hash": sibling_hash
            })

            # Move up
            next_nodes = []
            for i in range(0, len(current_nodes), 2):
                next_nodes.append(hash_pair(current_nodes[i], current_nodes[i + 1]))
            current_nodes = next_nodes
            index //= 2

        return proof

    def to_dict(self) -> Dict[str, Any]:
        return {
            "root": self.root_hash,
            "leaf_count": len(self.raw_leaves),
            "leaves": self.raw_leaves,
            "tree": self.root.to_dict()
        }


def verify_merkle_proof(leaf_hash: str, proof: List[Dict[str, str]], expected_root: str) -> bool:
    """Cryptographically verifies that leaf_hash belongs to the tree rooted at expected_root."""
    current = leaf_hash
    for step in proof:
        sibling = step["hash"]
        if step["position"] == "left":
            current = hash_pair(sibling, current)
        else:
            current = hash_pair(current, sibling)
    return current.lower() == expected_root.lower()
