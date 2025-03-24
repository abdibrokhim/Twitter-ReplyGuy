import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { useState } from "react";
import { TweetCardProps } from "./tweet-card";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
const ReplyGenerator = dynamic(() => import('@/components/ReplyGenerator'), { ssr: false });

interface ReplyDialogProps {
  tweet: TweetCardProps;
  children: React.ReactNode;
}

export function ReplyDialog({ tweet, children }: ReplyDialogProps) {
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySent, setReplySent] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setReplyText("");
      setReplySent(false);
      setShowAiSuggestions(false);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] overflow-y-auto max-h-[90vh]">
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                  >
                    {showAiSuggestions ? "Hide AI Suggestions" : "Show AI Suggestions"}
                  </Button>
                </div>
                
                {showAiSuggestions && (
                  <ReplyGenerator
                    tweetContent={tweet.content}
                    tweetAuthor={tweet.author.handle}
                    onReplySelect={(reply) => setReplyText(reply)}
                  />
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