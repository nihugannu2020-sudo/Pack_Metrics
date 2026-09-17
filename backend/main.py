from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import os
import base64
import io
import google.generativeai as genai
from PIL import Image

# Configure Gemini if key is available
if os.getenv("GOOGLE_API_KEY"):
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI(title="PackMetrics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock in-memory database
db = {
    "scans": [],
    "notices": [],
}

class ComplianceReport(BaseModel):
    id: str
    timestamp: str
    productName: str
    manufacturerName: str
    isImported: bool
    imageUrl: Optional[str] = ""
    imageUrls: Optional[List[str]] = []
    extractedText: str
    words: List[Any] = []
    results: List[Any]
    passCount: int
    failCount: int
    reviewCount: int
    overallStatus: str
    submittedBy: Optional[str] = None
    submittedByRole: Optional[str] = None
    reviewStatus: Optional[str] = None
    reviewedBy: Optional[str] = None
    imageDimensions: Optional[Any] = None

class LegalNotice(BaseModel):
    id: str
    noticeNumber: str
    scanId: str
    date: str
    manufacturerName: str
    manufacturerAddress: str
    productName: str
    violations: List[Any]
    status: str
    issuedBy: str

@app.get("/api/scans", response_model=List[ComplianceReport])
def get_scans():
    return db["scans"]

@app.post("/api/scans", response_model=ComplianceReport)
def create_scan(scan: ComplianceReport):
    if not scan.id:
        scan.id = f"SCAN-{uuid.uuid4().hex[:8].upper()}"
    if not scan.timestamp:
        scan.timestamp = datetime.utcnow().isoformat() + "Z"
    
    # Check for duplicates to update instead
    for i, s in enumerate(db["scans"]):
        if s["id"] == scan.id:
            db["scans"][i] = scan.dict()
            return scan
            
    db["scans"].insert(0, scan.dict())
    return scan

@app.put("/api/scans/{scan_id}/review", response_model=ComplianceReport)
def update_scan_review(scan_id: str, review_data: Dict[str, Any]):
    for i, scan in enumerate(db["scans"]):
        if scan["id"] == scan_id:
            scan.update(review_data)
            return scan
    raise HTTPException(status_code=404, detail="Scan not found")

@app.get("/api/notices", response_model=List[LegalNotice])
def get_notices():
    return db["notices"]

@app.post("/api/notices", response_model=LegalNotice)
def create_notice(notice: LegalNotice):
    db["notices"].insert(0, notice.dict())
    return notice

@app.put("/api/notices/{notice_id}/status", response_model=LegalNotice)
def update_notice_status(notice_id: str, status_data: Dict[str, str]):
    for i, notice in enumerate(db["notices"]):
        if notice["id"] == notice_id:
            notice["status"] = status_data["status"]
            return notice
    raise HTTPException(status_code=404, detail="Notice not found")

class OCRRequest(BaseModel):
    image_url: str

@app.post("/api/ocr")
def process_ocr(req: OCRRequest):
    # Decode base64 image (format is usually "data:image/png;base64,...")
    try:
        header, encoded = req.image_url.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid base64 image")

    if os.getenv("GOOGLE_API_KEY"):
        try:
            model = genai.GenerativeModel('gemini-1.5-pro')
            prompt = """
            Perform highly accurate Computer Vision OCR (Optical Character Recognition) on this packaging image. 
            Extract ALL text exactly as it appears, including small print, ingredients, manufacturer details, pricing, net weight, and nutritional facts. 
            Do NOT summarize, do NOT add conversational commentary, and do NOT hallucinate text that is not visible. 
            Return the raw extracted text maintaining line breaks where appropriate.
            """
            response = model.generate_content([prompt, image])
            extracted_text = response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            extracted_text = "Error calling AI model. Please check logs."
    else:
        # Fallback structured mock if no API key
        extracted_text = (
            "INDIA FINEST ULTRA WHITE PAPER\n"
            "MICRO PERFORATED SHEETS FOR EASY TEAR-OFF\n"
            "INTERNATIONAL QUALITY 70 GSM PAPER\n"
            "MULTI COLOUR POLY SEPARATORS\n"
            "Net Weight: 250g\n"
            "Manufactured by: PackMetrics Mock Industries\n"
            "MRP: Rs. 99.00 (Incl. of all taxes)\n"
            "Batch No: PM-2026-X1\n"
            "Best Before: 12 months from manufacture\n"
        )

    # Note: Returning empty words array as getting exact bounding boxes from Gemini requires a specialized prompt/output structure
    # and is complex for a prototype. We just need the text for the rule engine.
    return {
        "text": extracted_text,
        "words": [],
        "status": "success"
    }

class ExplainRequest(BaseModel):
    results: List[Any]
    extractedText: str

@app.post("/api/explain")
def explain_rules(req: ExplainRequest):
    explanations = {}
    
    if os.getenv("GOOGLE_API_KEY"):
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            # For prototype speed, we ask it to explain all rules in one go
            prompt = f"You are a compliance assistant. The user extracted this text from a package: '{req.extractedText}'. "
            prompt += "Here are the compliance rule results:\n"
            for r in req.results:
                prompt += f"- Rule {r.get('ruleId')}: {r.get('status')}. (Ref: {r.get('title')})\n"
            
            prompt += "\nFor each Rule ID above, provide a very simple, 1-2 sentence explanation for beginners on WHY it passed or failed, and HOW to fix it if it failed. Format your response exactly as: RULE_ID: Explanation text..."
            
            response = model.generate_content(prompt)
            
            for line in response.text.split('\n'):
                if ':' in line:
                    parts = line.split(':', 1)
                    rule_id = parts[0].strip().replace("-", "").strip()
                    # Fuzzy match rule id
                    for r in req.results:
                        if r.get("ruleId") in rule_id or rule_id in r.get("ruleId"):
                            explanations[r.get("ruleId")] = parts[1].strip()
        except Exception as e:
            print(f"Gemini API Error: {e}")
            
    # Fallback/default explanations
    for r in req.results:
        if r.get("ruleId") not in explanations:
            if r.get("status") == "pass":
                explanations[r.get("ruleId")] = "Great! We found the required text on the package, so this rule passes."
            elif r.get("status") == "fail":
                explanations[r.get("ruleId")] = "We couldn't find the required text. Please ensure this information is clearly printed on the label."
            else:
                explanations[r.get("ruleId")] = "This rule requires a human to verify it. Please check the physical package to ensure it complies."
                
    return explanations

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
