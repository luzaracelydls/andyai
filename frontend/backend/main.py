from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_artwork(request: Request):
    # Mock response structure
    return {
        "level": "Intermediate",
        "issue": "The lighting contrast is a bit flat.",
        "suggestion": "Try increasing the range between your darkest shadows and brightest highlights.",
        "challenge": "Paint a sphere with a single light source to practice value control."
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
