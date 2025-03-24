// Environment variables configuration
const config = {
  twitter: {
    bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
    apiKey: process.env.TWITTER_API_KEY || '',
    apiSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || '',
  },
  aiml: {
    apiKey: process.env.AIML_API_KEY || '',
  },
  toolhouse: {
    apiKey: process.env.TOOLHOUSE_API_KEY || '',
  }
};

export default config; 