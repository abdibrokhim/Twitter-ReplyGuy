import { NextRequest, NextResponse } from 'next/server';
import { generateReplies, ReplyRequest, ReplyResponse } from '@/lib/reply-generator';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await req.json();
    
    // Check for required fields
    if (!body.tweetContent || !body.tweetAuthor) {
      return NextResponse.json(
        { error: 'Missing required fields: tweetContent and tweetAuthor' },
        { status: 400 }
      );
    }
    
    // Prepare request data
    const request: ReplyRequest = {
      tweetContent: body.tweetContent,
      tweetAuthor: body.tweetAuthor,
      tweetContext: body.tweetContext || undefined
    };
    
    // Generate replies
    const response: ReplyResponse = await generateReplies(request);
    
    // Check for errors
    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }
    
    // Return the generated replies
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in generate-replies API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate replies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 