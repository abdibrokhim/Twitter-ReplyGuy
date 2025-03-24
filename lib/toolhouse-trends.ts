import { Toolhouse } from "@toolhouseai/sdk";
import OpenAI from "openai";
import { TweetCardProps } from '@/components/ui/tweet-card';
import { FilterOptions } from '@/components/ui/tweet-filters';
import config from './config';
import { fetchTrends as fetchMockTrends } from './tweets';

// Define function call tweet structure
interface ToolhouseTweet {
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
  const { likes, replies, retweets, views, trending } = metrics;
  
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
    (trending ? 10 : 0)
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

export async function fetchTrendsWithToolhouse(filters: FilterOptions): Promise<TweetCardProps[]> {
  try {
    console.log('Fetching trends using Toolhouse as fallback...');

    if (!config.toolhouse?.apiKey) {
      console.warn('Toolhouse API key not found. Using mock data instead.');
      return fetchMockTrends(filters);
    }
    
    // Initialize Toolhouse
    const toolhouse = new Toolhouse({
      apiKey: config.toolhouse.apiKey,
      metadata: {
        "id": "replyguy",
        "timezone": "0"
      }
    });

    // Initialize OpenAI client (for LLM)
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

    // Set up the messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
      "role": "user",
      "content": `Search the web for ${searchQuery}. Find the most engaging and trending posts on Twitter/X. 
      For each post, extract the author name, username, post content, approximate timestamp, and engagement metrics 
      (likes, replies, retweets, views if available). Format the results as an array of JSON objects.`,
    }];

    // Get the tools from Toolhouse
    const tools = await toolhouse.getTools() as OpenAI.Chat.Completions.ChatCompletionTool[];
    
    // Make the initial completion request
    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: "gpt-4o",
      tools
    });

    // Run the tools with Toolhouse
    const toolhouseMessages = await toolhouse.runTools(chatCompletion) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    // Combine messages and get final response
    const newMessages = [...messages, ...toolhouseMessages];
    const chatCompleted = await openai.chat.completions.create({
      messages: newMessages,
      model: "gpt-4o",
      tools
    });

    // Process the response
    const assistantMessage = chatCompleted.choices[0]?.message?.content;
    
    if (!assistantMessage) {
      console.warn('No content in Toolhouse response');
      return fetchMockTrends(filters);
    }

    // Try to parse the JSON response
    let data;
    try {
      // Find JSON in response if it's not pure JSON
      const jsonMatch = assistantMessage.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the whole response as JSON
        data = JSON.parse(assistantMessage);
      }
    } catch (error) {
      console.error('Error parsing Toolhouse response:', error);
      return fetchMockTrends(filters);
    }

    // Ensure data is an array
    const tweetsData = Array.isArray(data) ? data : [];
    
    if (tweetsData.length === 0) {
      console.warn('No tweets found in Toolhouse response');
      return fetchMockTrends(filters);
    }

    // Convert response to our app's format
    const tweets = tweetsData.map((tweet: any, index: number) => {
      const tweetData: ToolhouseTweet = {
        author_name: tweet.author_name || tweet.authorName || '',
        author_handle: tweet.author_handle || tweet.authorHandle || '',
        author_verified: tweet.author_verified || tweet.authorVerified || false,
        content: tweet.content || tweet.text || '',
        posted_at: tweet.posted_at || tweet.postedAt || tweet.timestamp || new Date().toISOString(),
        likes: tweet.likes || tweet.metrics?.likes || 0,
        replies: tweet.replies || tweet.metrics?.replies || 0,
        retweets: tweet.retweets || tweet.metrics?.retweets || 0,
        views: tweet.views || tweet.metrics?.views || 0,
        is_trending: tweet.is_trending || tweet.isTrending || tweet.trending || false
      };

      return {
        id: `toolhouse-${index}-${Date.now()}`,
        author: {
          name: tweetData.author_name,
          handle: tweetData.author_handle,
          avatar: `https://unavatar.io/x/${tweetData.author_handle}`,
        },
        content: tweetData.content,
        timestamp: getTimeAgo(tweetData.posted_at),
        metrics: {
          likes: tweetData.likes,
          replies: tweetData.replies,
          retweets: tweetData.retweets,
          views: tweetData.views,
        },
        viralPotential: calculateViralPotential({
          likes: tweetData.likes,
          replies: tweetData.replies,
          retweets: tweetData.retweets,
          views: tweetData.views,
          trending: tweetData.is_trending
        }),
        isVerified: tweetData.author_verified,
      };
    });

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
    
    console.log('Filtered tweets from Toolhouse:', filtered);
    
    // Sort by viral potential (highest first)
    return filtered.sort((a: TweetCardProps, b: TweetCardProps) => b.viralPotential - a.viralPotential);
  } catch (error) {
    console.error('Error fetching trends with Toolhouse:', error);
    // Fallback to mock data if Toolhouse API fails
    return fetchMockTrends(filters);
  }
} 