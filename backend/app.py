# # backend/app.py
# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# import sys
# from pathlib import Path

# # Import predict robustly for both `backend.app` (package) and direct `app` (script)
# try:
#     from . import predict  # type: ignore
# except Exception:
#     # When running from project root, ensure backend directory is on sys.path
#     backend_dir = str(Path(__file__).resolve().parent)
#     if backend_dir not in sys.path:
#         sys.path.insert(0, backend_dir)
#     import predict  # type: ignore

# app = FastAPI(title="GNSS Prediction API")

# # Allow cross-origin requests (useful for front-end testing)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # allow all origins
#     allow_credentials=True,
#     allow_methods=["*"],  # allow all HTTP methods
#     allow_headers=["*"]
# )

# # Root endpoint
# @app.get("/")
# async def root():
#     return {"message": "GNSS Prediction API running 🚀"}

# # Predict endpoint (POST only)
# @app.post("/predict")
# @app.post("/predict/")
# async def predict_endpoint(file: UploadFile = File(...)):
#     """
#     Accepts a CSV file and returns prediction using LSTM or Transformer
#     depending on large gaps in the data.
#     """
#     return await predict.predict(file)









from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import sys

# Import predict robustly
try:
    from . import predict  # type: ignore
except Exception:
    backend_dir = str(Path(__file__).resolve().parent)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    import predict  # type: ignore

app = FastAPI(title="GNSS Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "GNSS Prediction API running 🚀"}

@app.post("/predict")
@app.post("/predict/")
async def predict_endpoint(file: UploadFile = File(...)):
    """
    Accepts a CSV file and returns prediction using LSTM/Transformer
    depending on hybrid switching logic.
    """
    return await predict.predict(file)
