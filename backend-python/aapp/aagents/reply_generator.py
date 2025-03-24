from openai import OpenAI
from agents import Agent, Runner, function_tool
import asyncio
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from aapp.models import Reply, ReplyRequest
from aapp.config import OPENAI_API_KEY, OPENAI_MODEL, MAX_REPLIES_TO_GENERATE

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

class ReplyData(BaseModel):
    content: str
    strengths: List[str]
    estimated_engagement: int

class ReplyGeneratorAgent:
    def __init__(self):
        self.agent = self._create_agent()

    def _create_agent(self):
        """Create an OpenAI Agent for generating high-quality tweet replies."""
        
        # Define function tools using the decorator syntax
        @function_tool
        def analyze_tweet(tweet_content: str, author: str) -> Dict[str, Any]:
            """
            Analyze a tweet to understand its context and tone.
            
            Args:
                tweet_content: The content of the tweet to reply to
                author: The author of the tweet
                
            Returns:
                Analysis details including topics, tone, and engagement factors
            """
            # In a real implementation, this would use NLP to analyze the tweet
            # For now, we'll let the agent determine this
            return {
                "topics": [],
                "tone": "",
                "question_present": False,
                "engagement_factors": []
            }

        @function_tool
        def evaluate_reply(reply_content: str, original_tweet: str) -> Dict[str, Any]:
            """
            Evaluate the quality and potential engagement of a reply.
            
            Args:
                reply_content: The content of the reply to evaluate
                original_tweet: The original tweet being replied to
                
            Returns:
                Evaluation details including strengths and estimated engagement score
            """
            # This performs real evaluation of reply quality
            
            # Generate strengths based on content
            strengths = []
            
            if "?" in reply_content:
                strengths.append("Asks an open-ended question")
                
            if len(reply_content) < 140:
                strengths.append("Concise and direct")
                
            if "consider" in reply_content.lower():
                strengths.append("Encourages deeper thinking")
                
            if any(phrase in reply_content.lower() for phrase in ["i've", "i'd", "i think", "in my experience"]):
                strengths.append("Personal and authentic tone")
                
            if len(reply_content.split()) > 5 and len(reply_content) < 280:
                strengths.append("Appropriate length for platform")
            
            # More sophisticated engagement score calculation
            score = 50  # Base score
            
            # Adjust for length (prefer 80-150 chars)
            length = len(reply_content)
            if 80 <= length <= 150:
                score += 20
            elif length > 200:
                score -= 10
                
            # Bonus for questions
            if "?" in reply_content:
                score += 15
                
            # Bonus for relevant content
            original_words = set(original_tweet.lower().split())
            reply_words = set(reply_content.lower().split())
            overlap = len(original_words.intersection(reply_words))
            if overlap > 0:
                score += min(overlap * 2, 15)  # Maximum 15 points for relevance
                
            # Ensure score is in range
            score = min(max(score, 0), 100)
                
            return {
                "strengths": strengths[:3],  # Limit to top 3 strengths
                "estimated_engagement": score
            }

        # Create the agent with our custom tools
        agent = Agent(
            name="ReplyGenerator",
            instructions="""
            You are a Reply Guy expert, specialized in creating high-engagement replies to tweets.
            Your job is to:
            1. Generate replies that are likely to get engagement
            2. Evaluate potential engagement for each reply
            3. List strengths of each reply
            
            Guidelines for high-quality replies:
            - Ask thoughtful questions related to the tweet
            - Add additional value or insights
            - Use appropriate humor when suitable
            - Be authentic and conversational
            - Keep replies concise (under 280 characters)
            - Avoid generic comments or empty praise
            - Don't be too self-promotional
            - Tailor the tone to match the original tweet
            - Add relevant hashtags when appropriate, but don't overdo it
            - Create different types of replies (questions, insights, related experiences)
            
            When evaluating replies, consider:
            - Relevance to the original tweet
            - Likelihood of getting engagement (likes, replies)
            - Uniqueness and originality
            - Potential to start a conversation
            - Appropriate length and tone
            
            For estimated engagement score:
            - 90-100: Exceptional, likely to get high engagement
            - 70-89: Very good, above average engagement expected
            - 50-69: Good, moderate engagement expected
            - 30-49: Average, some engagement possible
            - 0-29: Below average, minimal engagement expected
            """,
            model=OPENAI_MODEL,
            tools=[analyze_tweet, evaluate_reply],
            output_type=List[ReplyData]
        )
        
        return agent
    
    async def generate_replies(self, request: ReplyRequest) -> List[Reply]:
        """Generate high-quality replies to a tweet using AI agent."""
        # Determine number of replies to generate
        num_replies = min(request.num_replies or MAX_REPLIES_TO_GENERATE, MAX_REPLIES_TO_GENERATE)
        
        # Craft the prompt for the agent
        prompt = f"""
        Generate {num_replies} high-quality, diverse replies to this tweet by @{request.tweet_author}:
        
        "{request.tweet_content}"
        
        {request.custom_instructions or ''}
        
        For each reply:
        1. Keep it under 280 characters
        2. Make it engaging and likely to get a response
        3. Be authentic and add value
        4. Evaluate each reply and provide strengths
        5. Estimate engagement score (0-100)
        
        Return a structured list of replies with all required fields.
        """
        
        try:
            # Run the agent using the Runner
            result = await Runner.run(
                self.agent,
                input=prompt,
                max_turns=5  # Limit the number of turns to prevent infinite loops
            )
            
            # Parse the generated replies from the final output
            reply_data_list = result.final_output
            
            # Convert to Reply model objects
            replies_data = []
            
            for reply_data in reply_data_list:
                reply = Reply(
                    content=reply_data.content,
                    strengths=reply_data.strengths,
                    estimated_engagement=reply_data.estimated_engagement
                )
                replies_data.append(reply)
                
            return replies_data
            
        except Exception as e:
            print(f"Error generating replies: {e}")
            return []