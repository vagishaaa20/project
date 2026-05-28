from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.web3_service import store_evidence, verify_evidence, get_all_evidence

router = APIRouter()


class StoreRequest(BaseModel):
    caseId:     str
    evidenceId: str
    fileHash:   str


class VerifyRequest(BaseModel):
    evidenceId: str
    fileHash:   str


# ── POST /blockchain/store ──────────────────────────────────
@router.post("/store")
def store(req: StoreRequest):
    try:
        result = store_evidence(req.caseId, req.evidenceId, req.fileHash)
        return {"success": True, **result}

    except ValueError as e:
        if "BLOCKCHAIN_DUPLICATE" in str(e):
            raise HTTPException(
                status_code=409,
                detail="Evidence already exists in blockchain"
            )
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Blockchain transaction failed: {str(e)}"
        )


# ── POST /blockchain/verify ─────────────────────────────────
@router.post("/verify")
def verify(req: VerifyRequest):
    try:
        result = verify_evidence(req.evidenceId, req.fileHash)
        return {"success": True, **result}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(e)}"
        )


# ── GET /blockchain/evidence ────────────────────────────────
@router.get("/evidence")
def evidence():
    try:
        records = get_all_evidence()
        return {"success": True, "records": records}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch evidence: {str(e)}"
        )