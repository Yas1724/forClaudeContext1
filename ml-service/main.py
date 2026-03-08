"""
ml-service/main.py
==================
FastAPI microservice exposing:
  POST /predict       <- calorie/macro targets from user profile (goal setup)
  POST /nutrition     <- nutrition lookup by dish name (text input)
  POST /classify      <- food classification from image upload
  GET  /health        <- liveness check

Run with:
    uvicorn main:app --reload --port 8000
"""
from dotenv import load_dotenv
import os
load_dotenv("../.env")  # goes up one level to find your .env

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from enum import Enum
import math

# Import your existing modules (place nutrition.py + classifier.py in same folder)
from nutrition import get_nutrition_safe
from classifier import get_classifier

app = FastAPI(title="NutriAI ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
#  /predict  — goal-based calorie & macro targets (called during onboarding)
# ─────────────────────────────────────────────────────────────────────────────
class GoalType(str, Enum):
    lose_weight  = "lose_weight"
    gain_weight  = "gain_weight"
    maintain     = "maintain"
    build_muscle = "build_muscle"

class ActivityLevel(str, Enum):
    sedentary         = "sedentary"
    lightly_active    = "lightly_active"
    moderately_active = "moderately_active"
    very_active       = "very_active"
    extra_active      = "extra_active"

class PredictRequest(BaseModel):
    age:            int
    gender:         str
    weight:         float
    height:         float
    activity_level: ActivityLevel
    goal:           GoalType

    @validator("age")
    def valid_age(cls, v):
        if not (10 <= v <= 120): raise ValueError("Age must be 10-120")
        return v

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2, "lightly_active": 1.375,
    "moderately_active": 1.55, "very_active": 1.725, "extra_active": 1.9,
}
GOAL_DELTA = { "lose_weight": -500, "gain_weight": 300, "build_muscle": 200, "maintain": 0 }
MACRO_RATIOS = {
    "lose_weight":  (0.40, 0.30, 0.30),
    "gain_weight":  (0.25, 0.50, 0.25),
    "build_muscle": (0.35, 0.40, 0.25),
    "maintain":     (0.30, 0.40, 0.30),
}

@app.post("/predict")
def predict(req: PredictRequest):
    if req.gender == "male":
        bmr = 10 * req.weight + 6.25 * req.height - 5 * req.age + 5
    else:
        bmr = 10 * req.weight + 6.25 * req.height - 5 * req.age - 161

    tdee     = bmr * ACTIVITY_MULTIPLIERS[req.activity_level]
    calories = max(round(tdee + GOAL_DELTA[req.goal]), 1200)
    pr, cr, fr = MACRO_RATIOS[req.goal]

    return {
        "calories":  calories,
        "protein_g": math.floor((calories * pr) / 4),
        "carbs_g":   math.floor((calories * cr) / 4),
        "fat_g":     math.floor((calories * fr) / 9),
        "bmr":       round(bmr),
        "tdee":      round(tdee),
    }


# ─────────────────────────────────────────────────────────────────────────────
#  /nutrition  — user types a meal name -> gets nutrition back
# ─────────────────────────────────────────────────────────────────────────────
class NutritionRequest(BaseModel):
    dish: str

    @validator("dish")
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Dish name cannot be empty")
        return v.strip()

@app.post("/nutrition")
def nutrition(req: NutritionRequest):
    """
    Lookup order (all handled inside nutrition.py):
      1. Cache
      2. Exact DB match
      3. Fuzzy DB match
      4. Parallel HuggingFace (Qwen 72B + Mistral/Llama) averaged
      5. Gemini (last resort)
    """
    result = get_nutrition_safe(req.dish)
    if result.get("error"):
        raise HTTPException(status_code=404, detail=result["message"])

    return {
        "dish":      result["dish"],
        "calories":  result["calories"],
        "protein":   result["protein"],
        "carbs":     result["carbs"],
        "fats":      result["fats"],
        "portion_g": result["portion_g"],
        "source":    result["source"],
    }


# ─────────────────────────────────────────────────────────────────────────────
#  /classify  — upload food photo -> classify -> auto-fetch nutrition
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    """
    1. EfficientNet-B2 classifies the food image
    2. If confident  -> auto-lookup nutrition for top prediction
    3. If uncertain  -> return top-3 predictions for user to confirm
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 10 MB)")

    classifier  = get_classifier()
    clf_result  = classifier.predict(image_bytes, top_k=3)
    top         = clf_result["top_prediction"]
    uncertain   = clf_result["is_uncertain"]

    nutrition_data = None
    if not uncertain:
        nutrition_data = get_nutrition_safe(top["dish"])
        if nutrition_data.get("error"):
            nutrition_data = None

    return {
        "top_prediction":  top,
        "all_predictions": clf_result["all_predictions"],
        "is_uncertain":    uncertain,
        "nutrition":       nutrition_data,
    }


# ─────────────────────────────────────────────────────────────────────────────
#  /health
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}
