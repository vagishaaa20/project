import os
import json
import hashlib
from datetime import datetime, timezone
from web3 import Web3

BASE_DIR          = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR          = os.path.join(BASE_DIR, "..", "..")
ABI_PATH          = os.path.join(ROOT_DIR, "build", "contracts", "EvidenceChain.json")  # updated path

POLYGON_RPC_URL   = os.getenv("POLYGON_RPC_URL",  "https://rpc-amoy.polygon.technology")
CONTRACT_ADDRESS  = os.getenv("CONTRACT_ADDRESS",  "0x28F1BE9bCDeDE58513471FfB187ae535FAd0D782")
PRIVATE_KEY       = os.getenv("PRIVATE_KEY")

print(f"[DEBUG] CONTRACT_ADDRESS = {CONTRACT_ADDRESS}")
print(f"[DEBUG] POLYGON_RPC_URL  = {POLYGON_RPC_URL}")

def _get_contract():
    web3 = Web3(Web3.HTTPProvider(POLYGON_RPC_URL))
    if not web3.is_connected():
        raise Exception("Blockchain not connected")

    with open(ABI_PATH) as f:
        abi = json.load(f)["abi"]                        # build/contracts has nested JSON

    contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)
    return web3, contract


def store_evidence(case_id: str, evidence_id: str, file_hash: str) -> dict:
    web3, contract = _get_contract()
    account = web3.eth.account.from_key(PRIVATE_KEY)

    try:
        tx = contract.functions.addEvidence(
            case_id, evidence_id, file_hash
        ).build_transaction({
            "from":     account.address,
            "nonce":    web3.eth.get_transaction_count(account.address),
            "gas":      300000,
            "maxFeePerGas":         web3.to_wei(35, "gwei"),
            "maxPriorityFeePerGas": web3.to_wei(25, "gwei"),
        })

        signed  = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        block   = web3.eth.get_block(receipt.blockNumber)

        return {
            "case_id":          case_id,
            "evidence_id":      evidence_id,
            "file_hash":        file_hash,
            "block_number":     receipt.blockNumber,
            "transaction_hash": receipt.transactionHash.hex(),
            "gas_used":         receipt.gasUsed,
            "block_timestamp":  datetime.fromtimestamp(
                                    block.timestamp, tz=timezone.utc
                                ).isoformat(),
        }

    except Exception as e:
        if "Evidence already exists" in str(e):
            raise ValueError("BLOCKCHAIN_DUPLICATE: Evidence already exists")
        raise


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
            "number":       i,
            "case_id":      event["args"]["caseId"],
            "evidence_id":  evidence_id,
            "hash":         event["args"]["hash"],
            "datetime":     datetime.fromtimestamp(
                                event["args"]["timestamp"], tz=timezone.utc
                            ).isoformat(),
            "block_number": event["blockNumber"],
            "transaction":  event["transactionHash"].hex(),
        })

    return records