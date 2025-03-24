import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { useState } from "react";
import { TweetCardProps } from "./tweet-card";
import { toast } from "sonner";

interface ReplyDialogProps {
  tweet: TweetCardProps;
  children: React.ReactNode;
}

export function ReplyDialog({ tweet, children }: ReplyDialogProps) {
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [replySent, setReplySent] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      generateSuggestions();
      setReplySent(false);
    } else {
      setReplyText("");
      setAiSuggestions([]);
    }
  };

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    try {
      // In a real app, we'd call an API endpoint for AI-generated suggestions
      // For now, we'll use smarter template-based suggestions
      const tweetText = tweet.content.toLowerCase();
      
      // Generate contextual suggestions based on tweet content
      const suggestions = [];
      
      // Check for key topics in the tweet
      if (tweetText.includes('ai') || tweetText.includes('artificial intelligence')) {
        suggestions.push("As someone working in AI, I'd love to hear more about your thoughts on the technology's long-term impact.");
        suggestions.push("Have you read any research about how AI could help solve this specific problem?");
      }
      
      if (tweetText.includes('blockchain') || tweetText.includes('crypto') || tweetText.includes('bitcoin')) {
        suggestions.push("Interesting take! What's your view on how regulation might affect this in the next year?");
        suggestions.push("I've been researching this area too - have you looked at the recent developments in layer 2 solutions?");
      }
      
      if (tweetText.includes('climate') || tweetText.includes('environment')) {
        suggestions.push("This is such an important point. Have you seen any promising tech solutions to this climate issue?");
        suggestions.push("I've been thinking about this problem too. What actions do you think individuals vs corporations should take?");
      }
      
      // General engaging replies that work for any topic
      suggestions.push(`I've been following your work on this. What data sources informed your perspective?`);
      suggestions.push(`This is fascinating! Do you think this trend will accelerate or slow down in the next few years?`);
      suggestions.push(`Great point! I'd add that we need to consider ${tweet.content.split(" ").slice(0, 3).join(" ")} from multiple angles.`);
      
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setAiSuggestions([
        `I completely agree with your take on ${tweet.content.split(" ").slice(0, 3).join(" ")}...`,
        `This is a really insightful point. Have you considered the opposite perspective?`,
        `I've been thinking about this topic a lot. Would love to hear more about your experiences with it.`,
        `Interesting! Do you have any recommended resources to learn more about this?`,
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendReply = async () => {
    // Call our API endpoint to send the reply
    try {
      setReplySent(true);
      
      // Call our API to post the reply to Twitter
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId: tweet.id, text: replyText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send reply');
      }
      
      toast.success("Your reply has been sent!");
      console.log("Replying to:", tweet.id, "with:", replyText);
      
      // Keep the dialog open for a moment to show the success state
      setTimeout(() => {
        setOpen(false);
        setReplyText("");
      }, 1500);
      
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error("Failed to send reply. Please try again.");
      setReplySent(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setReplyText(suggestion);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Reply to @{tweet.author.handle}</DialogTitle>
          <DialogDescription>
            Craft a reply that will get noticed. Stand out from other reply guys!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 text-sm">
            <span className="font-medium">{tweet.author.name}:</span> {tweet.content}
          </div>
          
          {replySent ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <div className="text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Reply Sent!</h3>
              <p className="text-sm text-zinc-500">Your reply has been posted successfully.</p>
            </div>
          ) : (
            <>
              <div>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  maxLength={280}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-zinc-500">
                    {280 - replyText.length} characters remaining
                  </p>
                  {replyText.length > 0 && (
                    <button 
                      onClick={() => setReplyText("")} 
                      className="text-xs text-zinc-500 hover:text-zinc-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">AI-Powered Reply Suggestions</h4>
                  <button
                    onClick={generateSuggestions}
                    disabled={isGenerating}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>
                {isGenerating ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {aiSuggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => applySuggestion(suggestion)}
                        className="text-left w-full text-sm p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            {!replySent && (
              <>
                <div className="flex items-center space-x-2">
                  <button className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    <span className="sr-only">Add emoji</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                  </button>
                  <button className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    <span className="sr-only">Add media</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </button>
                </div>
                <Button 
                  onClick={handleSendReply} 
                  disabled={replyText.trim().length === 0}
                >
                  Send Reply
                </Button>
              </>
            )}
            {replySent && (
              <Button variant="outline" onClick={() => setOpen(false)} className="ml-auto">
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 