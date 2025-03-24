# Reply Guy Backend

A FastAPI backend for the Reply Guy application. This service uses OpenAI's latest Agents SDK to find tweets and generate high-converting replies.

## Features

- Tweet search and analysis with viral potential scoring
- AI-powered reply generation with engagement estimates
- Clean API for frontend integration
- Structured outputs using OpenAI's latest JSON Schema capabilities
- Agent tracing for debugging and monitoring

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4o
   DEBUG=True
   MAX_TWEETS_TO_FETCH=10
   MAX_REPLIES_TO_GENERATE=5
   ```

## Running the API

Start the development server:
```
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000, and the interactive documentation can be accessed at http://localhost:8000/docs.

## API Endpoints

- `POST /api/tweets/search` - Search for tweets based on filters
- `GET /api/tweets/test` - Get test tweets for UI development
- `POST /api/replies/generate` - Generate replies for a tweet
- `GET /api/replies/test/{tweet_id}` - Get test replies for UI development

## Implementation Details

- Uses the latest OpenAI Agents SDK with function tools and Runner pattern
- Agent-based architecture for tweet finding and reply generation
- Structured function tools with type annotations
- Agent tracing for monitoring and debugging
- Efficient agent execution with max_turns limit to prevent infinite loops

## Agent Architecture

The system is built around two primary agents:

1. **TweetFinder Agent**: Finds and scores tweets based on viral potential
   - Simulates Twitter search (would use real API in production)
   - Calculates viral potential based on engagement metrics
   - Sorts and filters results

2. **ReplyGenerator Agent**: Creates engaging replies to tweets
   - Generates multiple reply options
   - Evaluates each reply for engagement potential
   - Highlights strengths of each reply

## Project Structure

```
backend/
├── app/
│   ├── agents/
│   │   ├── tweet_finder.py     # Agent for finding and analyzing tweets
│   │   └── reply_generator.py  # Agent for generating replies
│   ├── routers/
│   │   ├── tweets.py           # API routes for tweet operations
│   │   └── replies.py          # API routes for reply operations
│   ├── utils/
│   │   ├── logging.py          # Logging utilities
│   │   ├── validation.py       # Data validation utilities
│   │   ├── tweet_utils.py      # Tweet-related helper functions
│   │   └── openai_utils.py     # OpenAI API helper functions
│   ├── config.py               # Application configuration and agent tracing
│   ├── main.py                 # FastAPI application entry point
│   └── models.py               # Pydantic data models
└── requirements.txt            # Python dependencies
``` 