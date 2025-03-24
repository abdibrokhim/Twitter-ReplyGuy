from openai import OpenAI
from agents import Agent, Runner, function_tool
import uuid
import time
import json
import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from aapp.models import Tweet, TweetAuthor, TweetMetrics, TweetFilterRequest
from aapp.config import OPENAI_API_KEY, OPENAI_MODEL, MAX_TWEETS_TO_FETCH

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

class TweetData(BaseModel):
    id: str
    author_name: str
    author_handle: str
    author_verified: bool
    content: str
    timestamp: str
    likes: int
    replies: int
    retweets: int
    views: int
    viral_potential: int

class TweetFinderAgent:
    def __init__(self):
        self.agent = self._create_agent()

    def _create_agent(self):
        """Create an OpenAI Agent for finding tweets."""
        
        # Define function tools using the decorator syntax
        @function_tool
        def search_twitter(search_query: str, max_results: Optional[int] = 5) -> List[Dict[str, Any]]:
            """
            Search Twitter for recent tweets matching criteria.
            
            Args:
                search_query: The search query to find tweets. Use Twitter search syntax.
                max_results: Maximum number of tweets to return (default: 5)
                
            Returns:
                A list of tweets matching the search criteria
            """
            # This would connect to a real Twitter API in production
            # For now, we'll have the agent generate realistic tweets based on the criteria
            # The real implementation would use Twitter API via tweepy or similar
            return []
        
        @function_tool
        def analyze_tweet_potential(tweet_content: str, author_verified: bool, metrics: Dict[str, int], timestamp: str) -> int:
            """
            Analyze a tweet to calculate its viral potential score.
            
            Args:
                tweet_content: The content of the tweet
                author_verified: Whether the author is verified
                metrics: Dictionary with engagement metrics (likes, replies, retweets, views)
                timestamp: When the tweet was posted (e.g. "10 minutes ago")
                
            Returns:
                A viral potential score from 0-100
            """
            # Calculate viral potential based on real factors
            engagement = metrics.get("likes", 0) + (metrics.get("replies", 0) * 2) + (metrics.get("retweets", 0) * 3)
            views = max(metrics.get("views", 1000), 1)  # Avoid division by zero
            
            engagement_rate = engagement / views
            verified_bonus = 10 if author_verified else 0
            
            # Calculate recency
            recency = 10
            if "minutes ago" in timestamp:
                minutes_ago = int(timestamp.split(" ")[0])
                recency = max(10 - (minutes_ago / 60), 0)
            elif "hours ago" in timestamp:
                hours_ago = int(timestamp.split(" ")[0])
                recency = max(10 - (hours_ago), 0)
                
            # Combined score
            score = (engagement_rate * 50) + verified_bonus + (recency * 5)
            
            # Ensure score is between 0-100
            return min(max(int(score), 0), 100)

        # Create the agent with our custom tools
        agent = Agent(
            name="TweetFinder",
            instructions="""
            You are a Twitter search and analysis expert. Your job is to:
            1. Generate realistic tweets based on search criteria
            2. Format tweets with proper structure
            3. Calculate viral potential for each tweet
            
            When generating tweets:
            - Make them realistic and on-topic for the search query
            - Include appropriate hashtags and mentions when relevant
            - Vary the engagement metrics realistically
            - Ensure timestamps are recent (minutes to hours ago)
            - Mix verified and non-verified authors
            
            For viral potential calculation, consider:
            - Engagement rate (likes, replies, retweets relative to views)
            - Recency of the tweet
            - Verified status of the author
            - Content quality and likelihood of going viral
            
            The viral potential should be a score from 0-100 where:
            - 90-100: Extremely viral, trending content
            - 70-89: High potential for virality
            - 50-69: Above average engagement expected
            - 30-49: Moderate engagement expected
            - 0-29: Low engagement expected
            """,
            model=OPENAI_MODEL,
            tools=[search_twitter, analyze_tweet_potential],
            output_type=List[TweetData]
        )
        
        return agent
    
    async def find_tweets(self, filters: TweetFilterRequest) -> List[Tweet]:
        """Find tweets based on filter criteria using AI agent."""
        # Build search query from filters
        query_parts = []
        
        # Add topics if provided
        if filters.topics and len(filters.topics) > 0:
            topic_query = " OR ".join(filters.topics)
            query_parts.append(f"({topic_query})")
        
        # Add engagement filter
        if filters.min_engagement > 0:
            query_parts.append("min_faves:100")  # Approximate high engagement filter
            
        # Add verified filter
        if filters.only_verified:
            query_parts.append("is:verified")
            
        # Add reply filter
        if filters.exclude_replies:
            query_parts.append("-is:reply")
            
        # Default query if nothing specified
        if not query_parts:
            query_parts.append("is:popular")
            
        # Combine query parts
        search_query = " ".join(query_parts)
        
        # Determine max results
        max_results = min(filters.max_results or MAX_TWEETS_TO_FETCH, MAX_TWEETS_TO_FETCH)
        
        # Use the Runner to execute the agent
        prompt = f"""
        Generate {max_results} realistic tweets that match this search query: {search_query}.
        
        For each tweet:
        1. Create a unique ID
        2. Generate a realistic author name and handle
        3. Set verified status appropriately (about 20% should be verified)
        4. Write tweet content that matches the query and feels authentic
        5. Set realistic timestamps (within the last few hours)
        6. Include realistic engagement metrics (likes, replies, retweets, views)
        7. Calculate a viral potential score from 0-100
        
        Return the tweets as a structured list with all required fields.
        """
        
        try:
            # Run the agent with the Runner
            result = await Runner.run(
                self.agent, 
                input=prompt,
                max_turns=5  # Limit the number of turns to prevent infinite loops
            )
            
            # Parse the generated tweets from the final output
            tweet_data_list = result.final_output
            
            # Convert to Tweet model objects
            tweets_data = []
            
            for tweet_data in tweet_data_list:
                # Create Tweet object from the generated data
                tweet = Tweet(
                    id=tweet_data.id,
                    author=TweetAuthor(
                        name=tweet_data.author_name,
                        handle=tweet_data.author_handle,
                        avatar=f"https://unavatar.io/x/{tweet_data.author_handle}",
                        is_verified=tweet_data.author_verified
                    ),
                    content=tweet_data.content,
                    timestamp=tweet_data.timestamp,
                    metrics=TweetMetrics(
                        likes=tweet_data.likes,
                        replies=tweet_data.replies,
                        retweets=tweet_data.retweets,
                        views=tweet_data.views
                    ),
                    viral_potential=tweet_data.viral_potential
                )
                tweets_data.append(tweet)
            
            # Filter by viral potential
            if filters.min_viral_potential:
                tweets_data = [t for t in tweets_data if t.viral_potential >= filters.min_viral_potential]
                
            # Sort by viral potential (highest first)
            tweets_data.sort(key=lambda x: x.viral_potential, reverse=True)
            
            return tweets_data
            
        except Exception as e:
            print(f"Error finding tweets: {e}")
            return [] 