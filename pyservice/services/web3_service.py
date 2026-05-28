import os
import json
import hashlib
from datetime import datetime, timezone
from web3 import Web3

BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR      = os.path.join(BASE_DIR, "..", "..")
ABI_PATH      = os.path.join(ROOT_DIR, "compiled_code.json")

GANACHE_URL       = os.getenv("GANACHE_URL",       "http://127.0.0.1:7545")
CONTRACT_ADDRESS  = os.getenv("CONTRACT_ADDRESS",  "0x05eea1F3E401B42f83D73E7c07951E23466DCDf5")

def _get_contract():
    web3 = Web3(Web3.HTTPProvider(GANACHE_URL))
    if not web3.is_connected():
        raise Exception("Blockchain not connected")

    with open(ABI_PATH) as f:
        abi = json.load(f)["abi"]

    contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)
    web3.eth.default_account = web3.eth.accounts[0]
    return web3, contract


# ── from insert.py ─────────────────────────────────────────
def store_evidence(case_id: str, evidence_id: str, file_hash: str) -> dict:
    web3, contract = _get_contract()

    try:
        tx_hash = contract.functions.addEvidence(
            case_id, evidence_id, file_hash
        ).transact()

        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        block   = web3.eth.get_block(receipt.blockNumber)

        return {
            "case_id":           case_id,
            "evidence_id":       evidence_id,
            "file_hash":         file_hash,
            "block_number":      receipt.blockNumber,
            "transaction_hash":  receipt.transactionHash.hex(),
            "gas_used":          receipt.gasUsed,
            "block_timestamp":   datetime.fromtimestamp(
                                     block.timestamp, tz=timezone.utc
                                 ).isoformat(),
        }

    except Exception as e:
        if "Evidence already exists" in str(e):
            raise ValueError("BLOCKCHAIN_DUPLICATE: Evidence already exists")
        raise


# ── from verifyBlock.py ─────────────────────────────────────
def verify_evidence(evidence_id: str, file_hash: str) -> dict:
    _, contract = _get_contract()

    try:
        stored_hash = contract.functions.getEvidenceHash(evidence_id).call()
    except Exception:
        return {"tampered": True, "reason": "Evidence not found on blockchain"}

    tampered = stored_hash != file_hash
    return {
        "tampered":    tampered,
        "stored_hash": stored_hash,
        "given_hash":  file_hash,
        "status":      "AUTHENTIC" if not tampered else "TAMPERED",
    }


# ── from queryEvidence.py ───────────────────────────────────
def get_all_evidence() -> list:
    web3, contract = _get_contract()

    event_filter = contract.events.EvidenceAdded.create_filter(from_block=0)
    events       = event_filter.get_all_entries()

    records = []
    for i, event in enumerate(events, 1):
        evidence_id = event["args"]["evidenceId"]
        if isinstance(evidence_id, bytes):
            evidence_id = "0x" + evidence_id.hex()

        records.append({
            "number":      i,
            "case_id":     event["args"]["caseId"],
            "evidence_id": evidence_id,
            "hash":        event["args"]["hash"],
            "datetime":    datetime.fromtimestamp(
                               event["args"]["timestamp"], tz=timezone.utc
                           ).isoformat(),
            "block_number":  event["blockNumber"],
            "transaction":   event["transactionHash"].hex(),
        })

    return records