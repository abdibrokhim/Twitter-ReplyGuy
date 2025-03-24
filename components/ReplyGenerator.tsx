import { useState } from 'react';
import { ReplyOption } from '@/lib/reply-generator';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ReplyGeneratorProps {
  tweetContent: string;
  tweetAuthor: string;
  tweetContext?: string;
  onReplySelect?: (reply: string) => void;
}

const ReplyGenerator: React.FC<ReplyGeneratorProps> = ({
  tweetContent,
  tweetAuthor,
  tweetContext,
  onReplySelect
}) => {
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState<ReplyOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to generate replies
  const generateReplies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tweetContent,
          tweetAuthor,
          tweetContext
        }),
      });
      
      const data = await response.json();
      console.log('data: ', data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate replies');
      }
      
      setReplies(data.replies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      console.error('Error generating replies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle reply selection
  const handleReplySelect = (reply: string) => {
    if (onReplySelect) {
      onReplySelect(reply);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Reply Options</h3>
        <Button 
          onClick={generateReplies} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>Generate Replies</>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {replies.length > 0 ? (
        <div className="space-y-3">
          {replies.map((reply, index) => (
            <div 
              key={index} 
              className="p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  text-xs font-medium px-2 py-1 rounded-full
                  ${reply.type === 'controversial' ? 'bg-orange-100 text-orange-700' : ''}
                  ${reply.type === 'humorous' ? 'bg-purple-100 text-purple-700' : ''}
                  ${reply.type === 'insightful' ? 'bg-blue-100 text-blue-700' : ''}
                `}>
                  {reply.type.charAt(0).toUpperCase() + reply.type.slice(1)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReplySelect(reply.content)}
                >
                  Use This
                </Button>
              </div>
              <p className="text-gray-800 dark:text-gray-200">{reply.content}</p>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="p-8 text-center text-gray-500 border border-dashed rounded-md">
          Click "Generate Replies" to see AI-generated reply options
        </div>
      ) : null}
    </div>
  );
};

export default ReplyGenerator; 