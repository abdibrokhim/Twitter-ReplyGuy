import { Toolhouse } from "@toolhouseai/sdk";
import OpenAI from "openai";
import config from './config';

/**
 * Example function showing direct usage of Toolhouse API
 * This demonstrates how to use Toolhouse with OpenAI for
 * fetching web content and summarizing it.
 */
export async function getWebPageSummary(url: string): Promise<string> {
  try {
    // Check if Toolhouse API key is available
    if (!config.toolhouse?.apiKey) {
      console.warn('Toolhouse API key not found.');
      return "Toolhouse API key not configured. Please add TOOLHOUSE_API_KEY to your .env file.";
    }

    // Initialize Toolhouse
    const toolhouse = new Toolhouse({
      apiKey: config.toolhouse.apiKey,
      metadata: {
        "id": "replyguy",
        "timezone": "0"
      }
    });

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: config.aiml.apiKey,
      baseURL: "https://api.aimlapi.com/v1"
    });

    // Setup the initial message
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
      "role": "user",
      "content": `Get the contents of ${url} and summarize them in a few bullet points.`,
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

    // Return the summary
    return chatCompleted.choices[0]?.message?.content || "No summary available";
  } catch (error) {
    console.error('Error using Toolhouse:', error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Example function showing how to use Toolhouse to search for tweets
 */
export async function searchTweetsWithToolhouse(query: string): Promise<string> {
  try {
    // Check if Toolhouse API key is available
    if (!config.toolhouse?.apiKey) {
      console.warn('Toolhouse API key not found.');
      return "Toolhouse API key not configured. Please add TOOLHOUSE_API_KEY to your .env file.";
    }

    // Initialize Toolhouse
    const toolhouse = new Toolhouse({
      apiKey: config.toolhouse.apiKey,
      metadata: {
        "id": "replyguy",
        "timezone": "0"
      }
    });

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: config.aiml.apiKey,
      baseURL: "https://api.aimlapi.com/v1"
    });

    // Setup the initial message
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
      "role": "user",
      "content": `Search for trending tweets about "${query}". Find at least 5 tweets and format them as JSON with author name, handle, content, and engagement metrics.`,
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

    // Return the tweets
    return chatCompleted.choices[0]?.message?.content || "No tweets found";
  } catch (error) {
    console.error('Error searching tweets with Toolhouse:', error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
} 