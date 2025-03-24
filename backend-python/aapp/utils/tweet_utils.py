import re
from datetime import datetime, timedelta
from typing import List, Dict, Any

def calculate_viral_potential(metrics: Dict[str, int], timestamp: str, is_verified: bool = False) -> float:
    """
    Calculate viral potential score for a tweet based on:
    - Engagement metrics (likes, replies, retweets, views)
    - Recency (newer tweets have higher potential)
    - Verified status (verified accounts have higher potential)
    
    Returns a score between 0 and 1
    """
    # Get metrics
    likes = metrics.get('likes', 0)
    replies = metrics.get('replies', 0)
    retweets = metrics.get('retweets', 0)
    views = metrics.get('views', 0) or likes * 100  # Estimate views if not available
    
    # Calculate engagement rate (engagement / views)
    total_engagement = likes + replies * 2 + retweets * 3  # Weight replies and retweets higher
    engagement_rate = total_engagement / max(views, 1) if views > 0 else 0
    
    # Calculate recency (1.0 for very recent, decreasing over time)
    tweet_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    now = datetime.now().astimezone()
    hours_ago = (now - tweet_time).total_seconds() / 3600
    recency_factor = max(0, 1 - (hours_ago / 72))  # Linear decay over 3 days
    
    # Calculate final score
    base_score = engagement_rate * 0.7 + recency_factor * 0.3
    
    # Apply verified bonus
    if is_verified:
        base_score *= 1.2
    
    # Ensure score is between 0 and 1
    return min(1.0, base_score)

def extract_hashtags(content: str) -> List[str]:
    """Extract hashtags from tweet content"""
    return re.findall(r'#(\w+)', content)

def extract_mentions(content: str) -> List[str]:
    """Extract mentions from tweet content"""
    return re.findall(r'@(\w+)', content)

def get_tweet_topics(content: str) -> List[str]:
    """
    Return a simple list of possible topics from tweet content
    This is a simple implementation - in a real system, topic detection
    would use NLP or could be part of the agent functionality
    """
    # Simple keyword matching for demo purposes
    topics = []
    
    # Technology related
    if any(keyword in content.lower() for keyword in ['ai', 'tech', 'software', 'code', 'programming']):
        topics.append('Technology')
    
    # Business related
    if any(keyword in content.lower() for keyword in ['business', 'startup', 'entrepreneur', 'funding']):
        topics.append('Business')
    
    # Add more topics as needed
    
    return topics 