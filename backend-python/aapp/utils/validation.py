from typing import List
from aapp.models import Tweet, Reply

def validate_tweet(tweet: Tweet) -> bool:
    """
    Validate that a tweet has the required fields
    """
    if not tweet.id or not tweet.content or not tweet.author:
        return False
    
    # Ensure tweet has proper author information
    if not tweet.author.name or not tweet.author.handle:
        return False
    
    # Ensure metrics are available
    if not tweet.metrics:
        return False
    
    return True

def validate_tweets(tweets: List[Tweet]) -> List[Tweet]:
    """
    Filter out invalid tweets from a list
    """
    return [tweet for tweet in tweets if validate_tweet(tweet)]

def validate_reply(reply: Reply) -> bool:
    """
    Validate that a reply has the required fields
    """
    if not reply.content:
        return False
    
    # Replies should have some estimated engagement
    if reply.estimated_engagement < 0:
        return False
    
    return True

def validate_replies(replies: List[Reply]) -> List[Reply]:
    """
    Filter out invalid replies from a list
    """
    return [reply for reply in replies if validate_reply(reply)] 