from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from aapp.routers import tweets, replies
import uvicorn
# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="ReplyGuy API",
    description="AI-powered API for finding viral tweets and generating engaging replies",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tweets.router, prefix="/api/tweets", tags=["tweets"])
app.include_router(replies.router, prefix="/api/replies", tags=["replies"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to ReplyGuy API",
        "docs": "/docs",
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)