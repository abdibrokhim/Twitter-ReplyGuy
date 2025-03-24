from fastapi import APIRouter, HTTPException, Depends
from typing import List

from aapp.models import ReplyRequest, Reply, ReplyResponse
from aapp.aagents.reply_generator import ReplyGeneratorAgent

router = APIRouter()

# Create the ReplyGeneratorAgent instance
reply_generator = ReplyGeneratorAgent()

@router.post("/generate", response_model=ReplyResponse)
async def generate_replies(request: ReplyRequest):
    """
    Generate AI-powered replies to a tweet
    """
    try:
        replies = await reply_generator.generate_replies(request)
        return ReplyResponse(replies=replies, tweet_id=request.tweet_id)
    except Exception as e:
        print(f"Error generating replies: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating replies: {str(e)}")

@router.get("/test/{tweet_id}", response_model=ReplyResponse)
async def test_replies(tweet_id: str):
    """
    Get test replies for UI development
    """
    try:
        # Create a test request
        test_request = ReplyRequest(
            tweet_id=tweet_id,
            tweet_content="This is a test tweet about AI and technology. What do you think about the future of machine learning?",
            tweet_author="tech_user",
            num_replies=3
        )
        replies = await reply_generator.generate_replies(test_request)
        return ReplyResponse(replies=replies, tweet_id=tweet_id)
    except Exception as e:
        print(f"Error getting test replies: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting test replies: {str(e)}") 