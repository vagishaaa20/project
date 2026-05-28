import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.deepfake_service import analyze_video

router = APIRouter()


@router.post("/analyze")
async def analyze(
    video:      UploadFile = File(...),
    caseId:     str        = Form(...),
    evidenceId: str        = Form(...),
):
    suffix = os.path.splitext(video.filename)[1] or ".mp4"
    tmp    = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)

    try:
        shutil.copyfileobj(video.file, tmp)
        tmp.close()

        result = analyze_video(tmp.name)

        return {
            "success":         True,
            "caseId":          caseId,
            "evidenceId":      evidenceId,
            "avg_probability": result["avg_probability"],
            "prediction":      result["prediction"],
            "frames_analyzed": result["frames_analyzed"],
            "total_frames":    result["total_frames"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        try:
            os.unlink(tmp.name)
        except:
            pass