# ReplyGuy - Twitter Trend Analysis Tool

![promo-image](./public//reply-guy-cover.png)

ReplyGuy helps you find trending tweets and generates engaging replies to boost your engagement.

## Features

- Find trending tweets on specific topics
- Analyze viral potential using engagement metrics
- Generate engaging replies to boost your Twitter presence
- Filter tweets by verified users, engagement level, and viral potential

## Technical Implementation

The application uses multiple AI APIs to ensure reliable data retrieval:

1. **OpenAI API** - Primary source for finding trending tweets via web browsing
2. **Toolhouse API** - Fallback mechanism when OpenAI responses are empty or have errors

### Fallback Architecture

We've implemented a robust fallback system:

1. The system first attempts to retrieve trending tweets using OpenAI's web search capability
2. If OpenAI returns empty results or encounters errors, the system automatically falls back to Toolhouse
3. As a final fallback, if both APIs fail, we return mock data for demonstration purposes

## Setup

1. Clone this repository `https://github.com/abdibrokhim/Twitter-ReplyGuy`.
2. Copy `.env.example` to `.env` and fill in your API keys:
   ```
   # OpenAI API key (primary API)
   OPENAI_API_KEY=your_openai_key_here
   
   # AIML API key (hosted OpenAI solution)
   AIML_API_KEY=your_aiml_key_here
   
   # Toolhouse API key (fallback API)
   TOOLHOUSE_API_KEY=your_toolhouse_key_here
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Toolhouse Integration

We use Toolhouse as a fallback mechanism when OpenAI responses fail. The integration follows these steps:

1. Initialize the Toolhouse SDK with your API key
2. Get the available tools from Toolhouse
3. Make a request to OpenAI with the tools
4. Process the response with Toolhouse's `runTools` method
5. Format the results for display in the UI

For more information on Toolhouse, visit [https://toolhouse.ai](https://toolhouse.ai).