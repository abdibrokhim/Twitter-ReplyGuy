import { generateRepliesPrompt, systemPrompt } from "./prompts";
import { OpenAI } from "openai";
import config from "./config";

export type ReplyOption = {
  type: 'controversial' | 'humorous' | 'insightful';
  content: string;
};

export type ReplyRequest = {
  tweetContent: string;
  tweetAuthor: string;
  tweetContext?: string;
};

export type ReplyResponse = {
  replies: ReplyOption[];
  error?: string;
};

export async function generateReplies(
  request: ReplyRequest
): Promise<ReplyResponse> {
  try {
    const { tweetContent, tweetAuthor, tweetContext = "" } = request;

    // Create OpenAI client
    const client = new OpenAI({
        baseURL: "https://api.aimlapi.com/v1",
        apiKey: config.aiml.apiKey as string,
    });

    // Make the API call to generate replies
    const response = await client.chat.completions.create({
      model: config.openai.model as string,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: generateRepliesPrompt(tweetContent, tweetAuthor, tweetContext),
        },
      ],
      temperature: 0.9,
      max_tokens: 300,
    });

    // Parse response and extract replies
    const content = response.choices[0].message.content || "";
    console.log('content: ', content);
    // Parse the content string to extract the three reply types
    const replies = parseReplies(content);
    console.log('replies: ', replies);
    
    return { replies };
  } catch (error) {
    console.error("Error generating replies:", error);
    return { 
      replies: [],
      error: error instanceof Error ? error.message : "Failed to generate replies"
    };
  }
}

// Helper function to parse the replies from the model output
function parseReplies(content: string): ReplyOption[] {
  // Initialize replies array
  const replies: ReplyOption[] = [];
  
  // Split the content by double newlines to separate different replies
  const paragraphs = content.split('\n\n').filter(para => para.trim().length > 0);
  
  // If we have the expected 3 replies, assign them types in order
  if (paragraphs.length === 3) {
    const types: ReplyOption['type'][] = ['controversial', 'humorous', 'insightful'];
    
    paragraphs.forEach((paragraph, index) => {
      if (index < types.length) {
        replies.push({
          type: types[index],
          content: paragraph.trim()
        });
      }
    });
  } 
  // If we don't have exactly 3, try to split by single newlines
  else if (paragraphs.length < 3) {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const types: ReplyOption['type'][] = ['controversial', 'humorous', 'insightful'];
    
    // Group lines into replies - assume each third of the lines is a different reply type
    const linesPerReply = Math.ceil(lines.length / 3);
    
    for (let i = 0; i < 3; i++) {
      const startIdx = i * linesPerReply;
      const endIdx = Math.min(startIdx + linesPerReply, lines.length);
      const replyContent = lines.slice(startIdx, endIdx).join(' ').trim();
      
      if (replyContent) {
        replies.push({
          type: types[i],
          content: replyContent
        });
      }
    }
  }

  return replies;
} 