import { OpenAI } from 'openai';
import { TweetCardProps } from '@/components/ui/tweet-card';
import { FilterOptions } from '@/components/ui/tweet-filters';
import config from './config';
import { fetchTrends as fetchMockTrends } from './tweets';
import { fetchTrendsWithToolhouse } from './toolhouse-trends';

// Define tweet structure for OpenAI response
interface OpenAITweet {
  author_name: string;
  author_handle: string;
  author_verified: boolean;
  content: string;
  posted_at: string;
  metrics: {
    likes: number;
    replies: number;
    retweets: number;
    views: number;
    trending: boolean;
  };
}

// Define function call tweet structure
interface FunctionCallTweet {
  author_name: string;
  author_handle: string;
  author_verified: boolean;
  content: string;
  posted_at: string;
  likes: number;
  replies: number;
  retweets: number;
  views: number;
  is_trending: boolean;
}

// Calculate viral potential score based on engagement metrics
function calculateViralPotential(metrics: any): number {
  const { likes, replies, retweets, views } = metrics;
  
  if (!views || views === 0) return 50;
  
  const engagementRate = 
    ((replies || 0) * 2 + 
     (retweets || 0) * 3 + 
     (likes || 0)) / 
    (views || 1);
  
  // Calculate viral potential on a scale of 0-100
  const viralPotential = Math.min(100, Math.round(
    (engagementRate * 50) + 
    (views > 10000 ? 30 : views > 1000 ? 20 : 10) + 
    (metrics.trending ? 10 : 0)
  ));
  
  return Math.max(0, viralPotential);
}

// Get timestamp string in "X minutes ago" format
function getTimeAgo(tweetCreatedAt: string): string {
  const tweetDate = new Date(tweetCreatedAt);
  const now = new Date();
  const diffMs = now.getTime() - tweetDate.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export async function fetchTrendsFromWeb(filters: FilterOptions): Promise<TweetCardProps[]> {
  try {
    console.log('Fetching trends from the web using OpenAI...');

    if (!config.aiml.apiKey) {
      console.warn('AIML API key not found. Using mock data instead.');
      return fetchMockTrends(filters);
    }
    
    const openai = new OpenAI({
      apiKey: config.aiml.apiKey,
      baseURL: "https://api.aimlapi.com/v1"
    });

    // Generate search query based on filters
    let searchQuery = "latest trending tweets";
    
    if (filters.topics.length > 0) {
      searchQuery = `latest trending tweets about ${filters.topics.join(', ')}`;
    }
    
    if (filters.onlyVerified) {
      searchQuery += " from verified accounts";
    }

    // Use OpenAI to search the web and extract trending content
    const response = await openai.responses.create({
      model: "gpt-4o",
      tools: [{ type: "web_search_preview" }],
      input: `Search the web for ${searchQuery}. Find the most engaging and trending posts on Twitter/X. For each post, extract the author name, username, post content, approximate timestamp, and engagement metrics (likes, replies, retweets, views if available).`,
      text: {
        format: {
          name: "twitter_trends",
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              tweets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    author_name: { type: "string" },
                    author_handle: { type: "string" },
                    author_verified: { type: "boolean" },
                    content: { type: "string" },
                    posted_at: { type: "string" },
                    metrics: {
                      type: "object",
                      properties: {
                        likes: { type: "number" },
                        replies: { type: "number" },
                        retweets: { type: "number" },
                        views: { type: "number" },
                        trending: { type: "boolean" }
                      },
                      required: ["likes", "replies", "retweets", "views", "trending"],
                      additionalProperties: false
                    }
                  },
                  required: ["author_name", "author_handle", "author_verified", "content", "posted_at", "metrics"],
                  additionalProperties: false
                }
              }
            },
            required: ["tweets"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    if (!response.output_text) {
      console.warn('No data found in OpenAI response, trying Toolhouse fallback...');
      return fetchTrendsWithToolhouse(filters);
    }

    // Parse the OpenAI response
    let data;
    try {
      data = JSON.parse(response.output_text);
      console.log('OpenAI response:', data);
    } catch (error) {
      console.warn('Error parsing OpenAI response, trying Toolhouse fallback...', error);
      return fetchTrendsWithToolhouse(filters);
    }
    
    if (!data.tweets || !Array.isArray(data.tweets) || data.tweets.length === 0) {
      console.warn('No tweets found in OpenAI response, trying Toolhouse fallback...');
      return fetchTrendsWithToolhouse(filters);
    }

    // Convert OpenAI response to our app's format
    const tweets = data.tweets.map((tweet: OpenAITweet, index: number) => ({
      id: `web-${index}-${Date.now()}`,
      author: {
        name: tweet.author_name,
        handle: tweet.author_handle,
        avatar: `https://unavatar.io/x/${tweet.author_handle}`,
      },
      content: tweet.content,
      timestamp: getTimeAgo(tweet.posted_at),
      metrics: {
        likes: tweet.metrics.likes,
        replies: tweet.metrics.replies,
        retweets: tweet.metrics.retweets,
        views: tweet.metrics.views,
      },
      viralPotential: calculateViralPotential(tweet.metrics),
      isVerified: tweet.author_verified,
    }));

    // Apply additional filters on client side
    const filtered = tweets.filter((tweet: TweetCardProps) => {
      // Apply minimum viral potential filter
      if (tweet.viralPotential < filters.minViralPotential) {
        return false;
      }
      
      // Apply minimum engagement filter
      const totalEngagement = 
        tweet.metrics.likes + 
        tweet.metrics.replies * 2 + 
        tweet.metrics.retweets * 3;
      
      if (totalEngagement < filters.minEngagement) {
        return false;
      }
      
      return true;
    });
    
    console.log('Filtered tweets from web:', filtered);
    
    // Sort by viral potential (highest first)
    return filtered.sort((a: TweetCardProps, b: TweetCardProps) => b.viralPotential - a.viralPotential);
  } catch (error) {
    console.error('Error fetching trends from web:', error);
    // Try Toolhouse fallback if OpenAI API fails
    console.log('Trying Toolhouse fallback...');
    return fetchTrendsWithToolhouse(filters);
  }
}

// Alternative implementation using function calling
export async function fetchTrendsWithFunctionCalling(filters: FilterOptions): Promise<TweetCardProps[]> {
  try {
    console.log('Fetching trends using OpenAI function calling...');

    if (!config.aiml.apiKey) {
      console.warn('OpenAI API key not found. Using mock data instead.');
      return fetchMockTrends(filters);
    }
    
    const openai = new OpenAI({
      apiKey: config.aiml.apiKey,
      baseURL: "https://api.aimlapi.com/v1"
    });

    // Generate search query based on filters
    let searchQuery = "latest trending tweets";
    
    if (filters.topics.length > 0) {
      searchQuery = `latest trending tweets about ${filters.topics.join(', ')}`;
    }
    
    if (filters.onlyVerified) {
      searchQuery += " from verified accounts";
    }

    // Define the function for get_trending_tweets
    const functionTools = [{
      type: "function" as const,
      name: "get_trending_tweets",
      description: "Fetch trending tweets based on given criteria",
      parameters: {
        type: "object",
        properties: {
          tweets: {
            type: "array",
            description: "List of trending tweets",
            items: {
              type: "object",
              properties: {
                author_name: { 
                  type: "string",
                  description: "Full name of the tweet author"
                },
                author_handle: { 
                  type: "string",
                  description: "Twitter/X handle of the author (without @)"
                },
                author_verified: { 
                  type: "boolean",
                  description: "Whether the author is verified"
                },
                content: { 
                  type: "string",
                  description: "Content/text of the tweet"
                },
                posted_at: { 
                  type: "string",
                  description: "Timestamp when the tweet was posted (ISO format or approximate like '2 hours ago')"
                },
                likes: { 
                  type: "number",
                  description: "Number of likes on the tweet" 
                },
                replies: { 
                  type: "number",
                  description: "Number of replies on the tweet" 
                },
                retweets: { 
                  type: "number",
                  description: "Number of retweets" 
                },
                views: { 
                  type: "number",
                  description: "Number of views, if available" 
                },
                is_trending: { 
                  type: "boolean",
                  description: "Whether the tweet is trending" 
                }
              },
              required: ["author_name", "author_handle", "author_verified", "content", "posted_at", "likes", "replies", "retweets", "views", "is_trending"],
              additionalProperties: false
            }
          }
        },
        required: ["tweets"],
        additionalProperties: false
      },
      strict: true
    }];

    // Use OpenAI to search the web with function calling
    const response = await openai.responses.create({
      model: "gpt-4o",
      tools: [{ type: "web_search_preview" }, ...functionTools],
      tool_choice: { type: "function", name: "get_trending_tweets" },
      input: `Search the web for ${searchQuery}. Find the most engaging and trending posts on Twitter/X. For each post, extract the author information, content, timestamp, and engagement metrics.`
    });

    // Check if we got a function call
    if (!response.output || response.output.length === 0 || response.output[0].type !== 'function_call') {
      console.warn('No function call in OpenAI response, trying Toolhouse fallback...');
      return fetchTrendsWithToolhouse(filters);
    }

    // Get function call data
    const functionCall = response.output[0];
    const argumentsString = functionCall.arguments;
    
    if (!argumentsString) {
      console.warn('No arguments in function call, trying Toolhouse fallback...');
      return fetchTrendsWithToolhouse(filters);
    }

    // Parse the function call arguments
    let data;
    try {
      data = JSON.parse(argumentsString);
    } catch (error) {
      console.warn('Error parsing function call arguments, trying Toolhouse fallback...', error);
      return fetchTrendsWithToolhouse(filters);
    }
    
    if (!data.tweets || !Array.isArray(data.tweets) || data.tweets.length === 0) {
      console.warn('No tweets found in function call arguments, trying Toolhouse fallback...');
      return fetchTrendsWithToolhouse(filters);
    }

    // Convert function call response to our app's format
    const tweets = data.tweets.map((tweet: FunctionCallTweet, index: number) => ({
      id: `fn-${index}-${Date.now()}`,
      author: {
        name: tweet.author_name,
        handle: tweet.author_handle,
        avatar: `https://unavatar.io/x/${tweet.author_handle}`,
      },
      content: tweet.content,
      timestamp: getTimeAgo(tweet.posted_at),
      metrics: {
        likes: tweet.likes,
        replies: tweet.replies,
        retweets: tweet.retweets,
        views: tweet.views,
      },
      viralPotential: calculateViralPotential({
        likes: tweet.likes,
        replies: tweet.replies,
        retweets: tweet.retweets,
        views: tweet.views,
        trending: tweet.is_trending
      }),
      isVerified: tweet.author_verified,
    }));

    // Apply additional filters on client side
    const filtered = tweets.filter((tweet: TweetCardProps) => {
      // Apply minimum viral potential filter
      if (tweet.viralPotential < filters.minViralPotential) {
        return false;
      }
      
      // Apply minimum engagement filter
      const totalEngagement = 
        tweet.metrics.likes + 
        tweet.metrics.replies * 2 + 
        tweet.metrics.retweets * 3;
      
      if (totalEngagement < filters.minEngagement) {
        return false;
      }
      
      return true;
    });
    
    console.log('Filtered tweets from function calling:', filtered);
    
    // Sort by viral potential (highest first)
    return filtered.sort((a: TweetCardProps, b: TweetCardProps) => b.viralPotential - a.viralPotential);
  } catch (error) {
    console.error('Error fetching trends with function calling:', error);
    // Try Toolhouse fallback if OpenAI function calling fails
    console.log('Trying Toolhouse fallback...');
    return fetchTrendsWithToolhouse(filters);
  }
} 