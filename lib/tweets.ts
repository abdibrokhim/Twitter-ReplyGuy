import { TweetCardProps } from "@/components/ui/tweet-card";
import { FilterOptions } from "@/components/ui/tweet-filters";

// Mock data for tweets
const MOCK_TWEETS: TweetCardProps[] = [
  {
    id: "t1",
    author: {
      name: "Elon Musk",
      handle: "elonmusk",
      avatar: "https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg",
    },
    content: "Excited to announce Tesla's new AI features coming next month. This will revolutionize how we think about autonomous driving! 🚗",
    timestamp: "2 minutes ago",
    metrics: {
      likes: 15432,
      replies: 2133,
      retweets: 3540,
      views: 1200000,
    },
    viralPotential: 92,
    isVerified: true,
  },
  {
    id: "t2",
    author: {
      name: "Sam Altman",
      handle: "sama",
      avatar: "https://pbs.twimg.com/profile_images/804990434455887872/BG0Xh7Oa_400x400.jpg",
    },
    content: "AGI will create more jobs than it destroys. The transition will be challenging but ultimately beneficial for humanity.",
    timestamp: "5 minutes ago",
    metrics: {
      likes: 8753,
      replies: 921,
      retweets: 1320,
      views: 540000,
    },
    viralPotential: 85,
    isVerified: true,
  },
  {
    id: "t3",
    author: {
      name: "Paul Graham",
      handle: "paulg",
      avatar: "https://pbs.twimg.com/profile_images/1824002576/pg-railsconf_400x400.jpg",
    },
    content: "The most successful founders I've known are relentlessly resourceful. They find a way to make things work, no matter what.",
    timestamp: "10 minutes ago",
    metrics: {
      likes: 5321,
      replies: 312,
      retweets: 782,
      views: 220000,
    },
    viralPotential: 78,
    isVerified: true,
  },
  {
    id: "t4",
    author: {
      name: "Balaji Srinivasan",
      handle: "balajis",
      avatar: "https://pbs.twimg.com/profile_images/1654276609091723265/WyJTBI20_400x400.jpg",
    },
    content: "The internet is becoming the operating system of our society. Those who understand this shift will build the next trillion-dollar companies.",
    timestamp: "15 minutes ago",
    metrics: {
      likes: 3810,
      replies: 289,
      retweets: 605,
      views: 150000,
    },
    viralPotential: 74,
    isVerified: true,
  },
  {
    id: "t5",
    author: {
      name: "Tech Enthusiast",
      handle: "techlover2023",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=techlover",
    },
    content: "Just tried the new MacBook Pro with M3 chip. It's blazing fast! 🔥 Anyone else using it for development work?",
    timestamp: "20 minutes ago",
    metrics: {
      likes: 215,
      replies: 42,
      retweets: 18,
      views: 9500,
    },
    viralPotential: 45,
    isVerified: false,
  },
  {
    id: "t6",
    author: {
      name: "CryptoWhale",
      handle: "crypto_whale",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto",
    },
    content: "Bitcoin is about to make a major move. The charts are showing a classic pattern we haven't seen since the 2017 bull run.",
    timestamp: "25 minutes ago",
    metrics: {
      likes: 1842,
      replies: 352,
      retweets: 421,
      views: 82000,
    },
    viralPotential: 68,
    isVerified: false,
  },
  {
    id: "t7",
    author: {
      name: "Climate Activist",
      handle: "savetheplanet",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=climate",
    },
    content: "New study shows we only have 8 years to drastically reduce carbon emissions before irreversible climate damage. We need action NOW.",
    timestamp: "30 minutes ago",
    metrics: {
      likes: 4210,
      replies: 892,
      retweets: 1532,
      views: 195000,
    },
    viralPotential: 82,
    isVerified: false,
  },
  {
    id: "t8",
    author: {
      name: "Startup Founder",
      handle: "founderlife",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=founder",
    },
    content: "Just closed our Series A! $12M to revolutionize how people shop online. Hiring engineers, designers, and product managers!",
    timestamp: "35 minutes ago",
    metrics: {
      likes: 923,
      replies: 154,
      retweets: 87,
      views: 45000,
    },
    viralPotential: 56,
    isVerified: false,
  },
  {
    id: "t9",
    author: {
      name: "Mark Zuckerberg",
      handle: "zuck",
      avatar: "https://pbs.twimg.com/profile_images/1657776563098845184/Jo17rUEr_400x400.jpg",
    },
    content: "The metaverse isn't just virtual reality. It's a new layer of reality that will enhance our physical world in ways we can't yet imagine.",
    timestamp: "40 minutes ago",
    metrics: {
      likes: 11562,
      replies: 2451,
      retweets: 2184,
      views: 890000,
    },
    viralPotential: 89,
    isVerified: true,
  },
  {
    id: "t10",
    author: {
      name: "Gaming News",
      handle: "gamingnews",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gaming",
    },
    content: "BREAKING: Sony announces PlayStation 6 development has officially begun. Expected release date in 2026.",
    timestamp: "45 minutes ago",
    metrics: {
      likes: 7621,
      replies: 1893,
      retweets: 2942,
      views: 520000,
    },
    viralPotential: 87,
    isVerified: false,
  },
];

export function fetchTrends(filters: FilterOptions): TweetCardProps[] {
  // Calculate total engagement for sorting
  const withEngagement = MOCK_TWEETS.map(tweet => ({
    ...tweet,
    totalEngagement: tweet.metrics.likes + tweet.metrics.replies * 2 + tweet.metrics.retweets * 3
  }));

  // Apply filters
  const filtered = withEngagement.filter(tweet => {
    // Filter by minimum engagement
    if (tweet.totalEngagement < filters.minEngagement) {
      return false;
    }

    // Filter by viral potential
    if (tweet.viralPotential < filters.minViralPotential) {
      return false;
    }

    // Filter by verified status
    if (filters.onlyVerified && !tweet.isVerified) {
      return false;
    }

    // Filter by topics if any are selected
    if (filters.topics.length > 0) {
      const tweetContent = tweet.content.toLowerCase();
      const matchesTopic = filters.topics.some(topic => 
        tweetContent.includes(topic.toLowerCase())
      );
      if (!matchesTopic) {
        return false;
      }
    }

    return true;
  });

  // Sort by engagement and viral potential (weighted)
  return filtered
    .sort((a, b) => {
      const scoreA = a.totalEngagement * 0.6 + a.viralPotential * 4;
      const scoreB = b.totalEngagement * 0.6 + b.viralPotential * 4;
      return scoreB - scoreA;
    })
    .map(({ totalEngagement, ...tweet }) => tweet); // Remove the added totalEngagement field
} 