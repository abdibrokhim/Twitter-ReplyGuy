import logging
import sys
from aapp.config import DEBUG

def setup_logger():
    """Set up the application logger"""
    logger = logging.getLogger("replyguy")
    
    # Set log level based on DEBUG setting
    log_level = logging.DEBUG if DEBUG else logging.INFO
    logger.setLevel(log_level)
    
    # Create console handler with formatting
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

# Create a global logger instance
logger = setup_logger() 