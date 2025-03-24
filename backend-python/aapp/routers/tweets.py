from fastapi import APIRouter, HTTPException, Depends
from typing import List

from aapp.models import TweetFilterRequest, Tweet, TweetResponse
from aapp.aagents.tweet_finder import TweetFinderAgent

router = APIRouter()

# Create the TweetFinderAgent instance
tweet_finder = TweetFinderAgent()

@router.post("/search", response_model=TweetResponse)
async def search_tweets(filters: TweetFilterRequest):
    """
    Search for tweets based on filter criteria
    """
    try:
        tweets = await tweet_finder.find_tweets(filters)
        return TweetResponse(tweets=tweets)
    except Exception as e:
        print(f"Error searching tweets: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching tweets: {str(e)}")

@router.get("/test", response_model=TweetResponse)
async def test_tweets():
    """
    Get test tweets for UI development
    """
    try:
        # Use default filters for testing
        test_filters = TweetFilterRequest(
            min_engagement=100,
            topics=["AI", "technology"],
            exclude_replies=True,
            only_verified=False,
            min_viral_potential=50,
            max_results=5
        )
        tweets = await tweet_finder.find_tweets(test_filters)
        return TweetResponse(tweets=tweets)
    except Exception as e:
        print(f"Error getting test tweets: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting test tweets: {str(e)}") 