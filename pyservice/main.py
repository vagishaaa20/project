from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.blockchain import router as blockchain_router
from routes.deepfake   import router as deepfake_router

app = FastAPI(title="TrustVault Python Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(blockchain_router, prefix="/blockchain")
app.include_router(deepfake_router,   prefix="/deepfake")

@app.get("/health")
def health():
    return {"status": "ok", "service": "trustvault-pyservice"}