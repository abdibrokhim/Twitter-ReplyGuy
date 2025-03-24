import { Client } from 'twitter-api-sdk';
import { TweetCardProps } from '@/components/ui/tweet-card';
import { FilterOptions } from '@/components/ui/tweet-filters';

// Initialize Twitter API client with bearer token from environment variables
const client = new Client(process.env.TWITTER_BEARER_TOKEN || '');

// Convert Twitter API user to our app's format
function mapUser(user: any): TweetCardProps['author'] {
  return {
    name: user.name,
    handle: user.username,
    avatar: user.profile_image_url || `https://unavatar.io/x/${user.username}`,
  };
}

// Calculate viral potential score based on engagement metrics
function calculateViralPotential(tweet: any, user: any): number {
  const { public_metrics } = tweet;
  
  if (!public_metrics) return 50;
  
  const followers = user.public_metrics?.followers_count || 1;
  const impressionsToFollowersRatio = (public_metrics.impression_count || 0) / followers;
  const engagementRate = 
    ((public_metrics.reply_count || 0) * 2 + 
     (public_metrics.retweet_count || 0) * 3 + 
     (public_metrics.like_count || 0)) / 
    (public_metrics.impression_count || 1);
  
  // Calculate viral potential on a scale of 0-100
  const viralPotential = Math.min(100, Math.round(
    (engagementRate * 50) + 
    (impressionsToFollowersRatio * 30) + 
    (tweet.possibly_sensitive ? -10 : 0) +
    (user.verified ? 10 : 0)
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

// Convert Twitter API tweet to our app's format
function mapTweet(tweet: any, user: any): TweetCardProps {
  const { public_metrics } = tweet;
  
  return {
    id: tweet.id,
    author: mapUser(user),
    content: tweet.text,
    timestamp: getTimeAgo(tweet.created_at),
    metrics: {
      likes: public_metrics?.like_count || 0,
      replies: public_metrics?.reply_count || 0,
      retweets: public_metrics?.retweet_count || 0,
      views: public_metrics?.impression_count || 0,
    },
    viralPotential: calculateViralPotential(tweet, user),
    isVerified: user.verified || false,
  };
}

export async function fetchTrendsFromTwitter(filters: FilterOptions): Promise<TweetCardProps[]> {
  try {
    // Build query parameters
    const queryParams = [];
    
    // Add topic filters if any
    if (filters.topics.length > 0) {
      queryParams.push(`(${filters.topics.join(' OR ')})`);
    }
    
    // Add minimum engagement filter (using is:popular built-in filter)
    if (filters.minEngagement > 500) {
      queryParams.push('is:popular');
    }
    
    // Exclude replies if enabled
    if (filters.excludeReplies) {
      queryParams.push('-is:reply');
    }
    
    // Only verified accounts if enabled
    if (filters.onlyVerified) {
      queryParams.push('is:verified');
    }
    
    // Default query if no filters specified
    const query = queryParams.length > 0 
      ? queryParams.join(' ') 
      : 'is:popular -is:retweet';
    
    // Get recent tweets with user data and metrics
    const response = await client.tweets.tweetsRecentSearch({
      query,
      max_results: 20,
      "tweet.fields": [
        "created_at",
        "public_metrics",
        "possibly_sensitive"
      ],
      "user.fields": [
        "name",
        "username",
        "profile_image_url",
        "verified",
        "public_metrics"
      ],
      "expansions": [
        "author_id"
      ]
    });
    
    if (!response.data || !response.includes?.users) {
      return [];
    }
    
    // Map Twitter API response to our app's format
    const tweets = response.data.map(tweet => {
      const user = response.includes?.users?.find(u => u.id === tweet.author_id);
      if (!user) return null;
      return mapTweet(tweet, user);
    }).filter(Boolean) as TweetCardProps[];
    
    // Apply additional filters on client side
    const filtered = tweets.filter(tweet => {
      // Filter by viral potential
      if (tweet.viralPotential < filters.minViralPotential) {
        return false;
      }
      
      return true;
    });
    
    // Sort by viral potential (highest first)
    return filtered.sort((a, b) => b.viralPotential - a.viralPotential);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return [];
  }
}