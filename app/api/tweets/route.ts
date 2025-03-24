import { NextResponse } from 'next/server';
import { fetchTrendsFromWeb, fetchTrendsWithFunctionCalling } from '@/lib/openai-trends';
import { FilterOptions } from '@/components/ui/tweet-filters';

export async function POST(request: Request) {
  try {
    // Parse the URL to check for query parameters
    const url = new URL(request.url);
    const method = url.searchParams.get('method') || 'structured';
    // const method = 'function';
    
    // Parse the filters from the request body
    const filters: FilterOptions = await request.json();
    
    // Fetch tweets using the specified method
    let tweets;
    if (method === 'function') {
      // Use function calling method
      tweets = await fetchTrendsWithFunctionCalling(filters);
    } else {
      // Use structured output method (default)
      tweets = await fetchTrendsFromWeb(filters);
    }
    
    // Return tweets as JSON
    return NextResponse.json({ tweets });
  } catch (error) {
    console.error('Error in tweets API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
} 