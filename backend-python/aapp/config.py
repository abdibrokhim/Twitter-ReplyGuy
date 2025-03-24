import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# API configuration
API_VERSION = os.getenv("API_VERSION", "1.0.0")
API_PREFIX = os.getenv("API_PREFIX", "/api")

# OpenAI configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

# Application settings
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
MAX_TWEETS_TO_FETCH = int(os.getenv("MAX_TWEETS_TO_FETCH", "10"))
MAX_REPLIES_TO_GENERATE = int(os.getenv("MAX_REPLIES_TO_GENERATE", "5"))

# Set up logging
logging_level = logging.DEBUG if DEBUG else logging.INFO
logging.basicConfig(
    level=logging_level,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)