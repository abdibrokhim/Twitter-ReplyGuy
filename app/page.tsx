"use client";

import { useState } from "react";
import { TweetFeed } from "@/components/ui/tweet-feed";
import { TweetFilters, FilterOptions } from "@/components/ui/tweet-filters";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  const [filters, setFilters] = useState<FilterOptions>({
    minEngagement: 100,
    topics: [],
    excludeReplies: false,
    onlyVerified: false,
    minViralPotential: 50,
  });

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSubscribe = () => {
    toast.success(
      "Subscribed to notifications!", {
        description: "You'll be notified when new viral tweets are detected.",
        action: {
          label: "Yaps!",
          onClick: () => console.log("dismiss"),
        },
        duration: 2000,
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-blue-500" fill="currentColor">
              <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
            </svg>
            <h1 className="text-xl font-bold">ReplyGuy</h1>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSubscribe} variant="outline" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Subscribe
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Find Viral Tweets and Reply Fast</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              ReplyGuy helps you identify high-engagement tweets early, so you can reply and gain maximum visibility. Be the reply that gets noticed!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
            <div className="order-2 md:order-1">
              <TweetFilters onFiltersChange={handleFiltersChange} />
              
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Pro Tips</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    Reply within 5 minutes for maximum visibility
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    Ask a genuine question to increase reply chances
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    Add value, not just empty praise
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    Use the AI suggestions to craft perfect replies
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <TweetFeed filters={filters} />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
          <p>© 2025 ReplyGuy. Not affiliated with Twitter/X. Created using Twitter API v2.</p>
          <p className="mt-2">
            <a href="#" className="hover:underline">Privacy Policy</a> • 
            <a href="#" className="hover:underline ml-2">Terms of Service</a> • 
            <a href="#" className="hover:underline ml-2">Contact</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
