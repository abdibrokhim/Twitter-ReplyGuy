import { TweetCard, TweetCardProps } from "./tweet-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { useEffect, useState } from "react";
import { FilterOptions } from "./tweet-filters";
import { toast } from "sonner";

interface TweetFeedProps {
  filters: FilterOptions;
}

export function TweetFeed({ filters }: TweetFeedProps) {
  const [tweets, setTweets] = useState<TweetCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trending");
  const [savedTweets, setSavedTweets] = useState<TweetCardProps[]>([]);

  // Load saved tweets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedTweets');
    if (saved) {
      try {
        setSavedTweets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved tweets', e);
      }
    }
  }, []);

  // Save tweets to localStorage when they change
  useEffect(() => {
    if (savedTweets.length > 0) {
      localStorage.setItem('savedTweets', JSON.stringify(savedTweets));
    }
  }, [savedTweets]);

  // Fetch tweets when filters change
  useEffect(() => {
    const fetchTweets = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('/api/tweets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filters),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch tweets');
        }
        
        const data = await response.json();
        setTweets(data.tweets || []);
      } catch (error) {
        console.error('Error fetching tweets:', error);
        toast.error('Failed to fetch tweets. Using backup data.');
        // Fall back to local fetch if API fails
        import('@/lib/tweets').then(module => {
          const results = module.fetchTrends(filters);
          setTweets(results);
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTweets();
  }, [filters]);

  // Handle saving/unsaving tweets
  const toggleSaveTweet = (tweet: TweetCardProps) => {
    const isSaved = savedTweets.some(saved => saved.id === tweet.id);
    
    if (isSaved) {
      setSavedTweets(savedTweets.filter(saved => saved.id !== tweet.id));
      toast.info('Tweet removed from saved items');
    } else {
      setSavedTweets([...savedTweets, tweet]);
      toast.success('Tweet saved for later');
    }
  };

  return (
    <div className="w-full max-w-xl">
      <Tabs defaultValue="trending" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Viral Tweets</h2>
          <TabsList>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="trending" className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full max-w-[500px] h-[220px] rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))
          ) : tweets.length > 0 ? (
            tweets.map(tweet => (
              <TweetCard 
                key={tweet.id}
                {...tweet}
                isSaved={savedTweets.some(saved => saved.id === tweet.id)}
                onSave={() => toggleSaveTweet(tweet)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-500">No tweets match your filters.</p>
              <p className="text-zinc-400 text-sm mt-1">Try adjusting your filter settings.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="new">
          <div className="text-center py-8">
            <p className="text-zinc-500">Coming soon!</p>
            <p className="text-zinc-400 text-sm mt-1">We're working on real-time updates for freshest tweets.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-4">
          {savedTweets.length > 0 ? (
            savedTweets.map(tweet => (
              <TweetCard 
                key={tweet.id}
                {...tweet}
                isSaved={true}
                onSave={() => toggleSaveTweet(tweet)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-500">No saved tweets yet.</p>
              <p className="text-zinc-400 text-sm mt-1">Save tweets to reply to them later.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 