from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TweetAuthor(BaseModel):
    name: str
    handle: str
    avatar: str
    is_verified: Optional[bool] = False

class TweetMetrics(BaseModel):
    likes: int = 0
    replies: int = 0
    retweets: int = 0
    views: int = 0

class Tweet(BaseModel):
    id: str
    author: TweetAuthor
    content: str
    timestamp: str
    metrics: TweetMetrics
    viral_potential: int = Field(0, ge=0, le=100)  # 0-100 scale

class TweetFilterRequest(BaseModel):
    min_engagement: Optional[int] = 100
    topics: Optional[List[str]] = []
    exclude_replies: Optional[bool] = False
    only_verified: Optional[bool] = False
    min_viral_potential: Optional[int] = 50
    max_results: Optional[int] = 5

class TweetResponse(BaseModel):
    tweets: List[Tweet]

class ReplyRequest(BaseModel):
    tweet_id: str
    tweet_content: str
    tweet_author: str
    custom_instructions: Optional[str] = None
    num_replies: Optional[int] = 3

class Reply(BaseModel):
    content: str
    strengths: List[str]
    estimated_engagement: int = Field(0, ge=0, le=100)

class ReplyResponse(BaseModel):
    replies: List[Reply]
    tweet_id: str 