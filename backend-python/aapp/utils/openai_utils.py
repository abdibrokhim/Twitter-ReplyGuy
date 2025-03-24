from openai import OpenAI
from typing import Dict, Any, List, Optional, TypeVar, Generic, Type
from pydantic import BaseModel, create_model
import json
from aapp.config import OPENAI_API_KEY, OPENAI_MODEL

T = TypeVar('T', bound=BaseModel)

def get_openai_client() -> OpenAI:
    """Returns an OpenAI client with the API key from config"""
    return OpenAI(api_key=OPENAI_API_KEY)

async def generate_completion(
    prompt: str, 
    model: str = OPENAI_MODEL,
    temperature: float = 0.7,
    max_tokens: int = 500,
    system_message: Optional[str] = None
) -> str:
    """
    Generate a text completion using OpenAI
    
    Args:
        prompt: The user prompt to send
        model: The OpenAI model to use
        temperature: Sampling temperature (0-1)
        max_tokens: Maximum tokens in the response
        system_message: Optional system message
        
    Returns:
        The generated text
    """
    client = get_openai_client()
    
    messages = []
    
    # Add system message if provided
    if system_message:
        messages.append({"role": "system", "content": system_message})
    
    # Add user prompt
    messages.append({"role": "user", "content": prompt})
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating completion: {e}")
        return ""

async def generate_structured_output(
    prompt: str,
    output_schema: Dict[str, Any],
    model: str = OPENAI_MODEL,
    temperature: float = 0.7,
    system_message: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate a structured output using OpenAI's structured output capabilities
    
    Args:
        prompt: The user prompt to send
        output_schema: JSON Schema defining the structure of the expected output
        model: The OpenAI model to use
        temperature: Sampling temperature (0-1)
        system_message: Optional system message
        
    Returns:
        The generated structured output as a dictionary
    """
    client = get_openai_client()
    
    messages = []
    
    # Add system message if provided
    if system_message:
        messages.append({"role": "system", "content": system_message})
    
    # Add user prompt
    messages.append({"role": "user", "content": prompt})
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            response_format={"type": "json_object"},
            tools=[{
                "type": "function",
                "function": {
                    "name": "generate_structured_output",
                    "description": "Generate a structured output based on the prompt",
                    "parameters": output_schema
                }
            }],
            tool_choice={"type": "function", "function": {"name": "generate_structured_output"}}
        )
        
        # Get the tool call response
        if response.choices[0].message.tool_calls:
            tool_call = response.choices[0].message.tool_calls[0]
            return json.loads(tool_call.function.arguments)
        
        # Fallback to parsing the content directly
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error generating structured output: {e}")
        return {}

async def generate_structured_model_output(
    prompt: str,
    model_class: Type[T],
    temperature: float = 0.7, 
    model: str = OPENAI_MODEL,
    system_message: Optional[str] = None
) -> T:
    """
    Generate output in the format of a Pydantic model
    
    Args:
        prompt: The user prompt
        model_class: The Pydantic model class to use for output
        temperature: Sampling temperature (0-1)
        model: The OpenAI model to use
        system_message: Optional system message
        
    Returns:
        An instance of the model_class
    """
    # Convert Pydantic model to JSON schema
    schema = model_class.model_json_schema()
    
    # Generate structured output
    data = await generate_structured_output(
        prompt=prompt,
        output_schema=schema,
        model=model,
        temperature=temperature,
        system_message=system_message
    )
    
    # Convert to Pydantic model instance
    return model_class.model_validate(data)

async def analyze_sentiment(text: str) -> Dict[str, float]:
    """
    Analyze the sentiment of a text using OpenAI
    
    Returns a dictionary with sentiment scores
    """
    sentiment_schema = {
        "type": "object",
        "properties": {
            "positive": {
                "type": "number",
                "description": "Positive sentiment score from 0 to 1"
            },
            "negative": {
                "type": "number",
                "description": "Negative sentiment score from 0 to 1"
            },
            "neutral": {
                "type": "number",
                "description": "Neutral sentiment score from 0 to 1"
            }
        },
        "required": ["positive", "negative", "neutral"]
    }
    
    system_message = "You are a sentiment analysis tool. Analyze the sentiment of the text and provide scores."
    prompt = f"Analyze the sentiment of this text: {text}"
    
    try:
        result = await generate_structured_output(
            prompt=prompt,
            output_schema=sentiment_schema,
            temperature=0.1,
            system_message=system_message
        )
        
        return result
    except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        return {"positive": 0.0, "negative": 0.0, "neutral": 1.0} 