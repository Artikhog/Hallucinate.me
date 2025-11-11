import requests
import wikipedia.api as wikipedia_api
from typing import Optional, Dict, Any
from dotenv import load_dotenv
import os
from openai import OpenAI
import json
from bs4 import BeautifulSoup

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_URL = os.getenv("OPENAI_URL")
MODEL_FOR_VALIDATION = os.getenv("MODEL_FOR_VALIDATION", "openrouter/polaris-alpha")
client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_URL)

def get_webpage_content(url: str) -> str:
    """Extract readable text content from a webpage URL."""
    try:
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        for script in soup(["script", "style"]):
            script.decompose()
        text = soup.get_text(separator=' ', strip=True)
        return ' '.join(text.split())
    except Exception as e:
        raise ValueError(f"Failed to fetch content from {url}: {str(e)}")

def validate_claim(
    context: str, 
    claim: str, 
    source_url: Optional[str] = None, 
    wikipedia_page: Optional[str] = None
) -> Dict[str, Any]:
    """
    Validate a claim against provided context and sources.
    
    Args:
        context: The original context where the claim was made
        claim: The specific claim to validate
        source_url: Optional URL to a source document
        wikipedia_page: Optional Wikipedia page name to use as reference
        
    Returns:
        Dictionary with 'is_true' (bool) and 'reasoning' (str) keys
    """
    source_content = None
    wikipedia_content = None
    
    if source_url:
        try:
            source_content = get_webpage_content(source_url)
        except Exception as e:
            print(f"Warning: Could not fetch source URL: {e}")
    
    if wikipedia_page:
        try:
            wikipedia_content = wikipedia_api.get_wikipedia_page(wikipedia_page)
        except Exception as e:
            print(f"Warning: Could not fetch Wikipedia page: {e}")
    
    user_prompt_parts = [
        f"Context: {context}",
        f"Claim to validate: {claim}"
    ]
    
    if source_content:
        user_prompt_parts.append(f"Source Document:\n{source_content}")
    else:
        user_prompt_parts.append("Source Document: Not provided")
    
    if wikipedia_content:
        user_prompt_parts.append(f"Wikipedia Reference:\n{wikipedia_content}")
    else:
        user_prompt_parts.append("Wikipedia Reference: Not provided")
    
    user_prompt = "\n\n".join(user_prompt_parts)
    
    # Enhanced system prompt for better hallucination detection
    system_prompt = """You are an expert fact-checker specializing in detecting LLM hallucinations. Your task is to determine if a claim made by an LLM is accurate or if it's a hallucination (false information not supported by the provided sources).

Guidelines:
1. A claim is TRUE if it can be verified by the context and/or provided sources
2. A claim is FALSE (hallucination) if:
   - It contradicts information in the sources
   - It makes specific factual claims not supported by the sources
   - It adds details that don't exist in the sources
   - It misrepresents or exaggerates information from the sources

3. If sources are not provided or insufficient, indicate uncertainty in your reasoning
4. Be strict: when in doubt, mark as FALSE if the claim cannot be verified
5. Provide clear, detailed reasoning explaining your decision

Respond with a JSON object containing:
- 'is_true': boolean (true if claim is accurate, false if it's a hallucination)
- 'reasoning': string (detailed explanation of your decision, citing specific evidence from sources when available)"""

    try:
        response = client.chat.completions.create(
            model=MODEL_FOR_VALIDATION,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1 
        )
        
        result = json.loads(response.choices[0].message.content)
        
        if not isinstance(result, dict) or 'is_true' not in result or 'reasoning' not in result:
            raise ValueError("Invalid response format from validation model")
        
        if not isinstance(result['is_true'], bool):
            result['is_true'] = result['is_true'].lower() in ('true', '1', 'yes')
        
        return result
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON response from validation model: {e}")
    except Exception as e:
        raise RuntimeError(f"Error during claim validation: {e}")


def validate_claim_with_wikipedia_search(
    context: str,
    claim: str,
    source_url: Optional[str] = None,
    auto_search: bool = True
) -> Dict[str, Any]:
    """
    Validate a claim with automatic Wikipedia search using LLM function calling.
    The LLM can automatically search Wikipedia for relevant information to verify the claim.
    
    Args:
        context: The original context where the claim was made
        claim: The specific claim to validate
        source_url: Optional URL to a source document
        auto_search: If True, allows LLM to search Wikipedia automatically (default: True)
        
    Returns:
        Dictionary with 'is_true' (bool) and 'reasoning' (str) keys
    """
    source_content = None
    
    if source_url:
        try:
            source_content = get_webpage_content(source_url)
        except Exception as e:
            print(f"Warning: Could not fetch source URL: {e}")
    
    # Get Wikipedia tool definitions
    wikipedia_tool = wikipedia_api.get_wikipedia_content_tool_definition()
    
    # Build initial user prompt
    user_prompt_parts = [
        f"Context: {context}",
        f"Claim to validate: {claim}"
    ]
    
    if source_content:
        user_prompt_parts.append(f"Source Document:\n{source_content}")
    else:
        user_prompt_parts.append("Source Document: Not provided")
    
    user_prompt = "\n\n".join(user_prompt_parts)
    
    # Enhanced system prompt with tool usage instructions
    system_prompt = """You are an expert fact-checker specializing in detecting LLM hallucinations. Your task is to determine if a claim made by an LLM is accurate or if it's a hallucination (false information not supported by the provided sources).

You have access to a Wikipedia search tool that you can use to verify factual claims. Use it when:
- The claim mentions specific facts, people, events, or concepts that need verification
- The provided source document doesn't contain enough information
- You need authoritative information to verify the claim

Guidelines:
1. A claim is TRUE if it can be verified by the context, provided sources, or Wikipedia
2. A claim is FALSE (hallucination) if:
   - It contradicts information in the sources or Wikipedia
   - It makes specific factual claims not supported by any source
   - It adds details that don't exist in the sources
   - It misrepresents or exaggerates information

3. Use the Wikipedia search tool proactively to verify claims about:
   - Historical events, dates, or facts
   - Biographical information
   - Scientific concepts or theories
   - Geographic information
   - Any factual claim that needs verification

4. Be strict: when in doubt, mark as FALSE if the claim cannot be verified
5. Provide clear, detailed reasoning explaining your decision and cite sources

After gathering all necessary information, respond with a JSON object containing:
- 'is_true': boolean (true if claim is accurate, false if it's a hallucination)
- 'reasoning': string (detailed explanation citing specific evidence from sources)"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    wikipedia_content = {}
    
    try:
        # First call: allow LLM to search Wikipedia if needed
        if auto_search:
            response = client.chat.completions.create(
                model=MODEL_FOR_VALIDATION,
                messages=messages,
                tools=[wikipedia_tool],
                tool_choice="auto",
                temperature=0.1
            )
            
            # Handle function calls iteratively
            max_iterations = 5  # Prevent infinite loops
            iteration = 0
            
            while iteration < max_iterations and response.choices[0].message.tool_calls:
                iteration += 1
                tool_calls = response.choices[0].message.tool_calls
                messages.append(response.choices[0].message)
                
                for tool_call in tool_calls:
                    if tool_call.function.name == "search_and_get_wikipedia_content":
                        args = json.loads(tool_call.function.arguments)
                        query = args.get("query")
                        max_pages = args.get("max_pages", 3)
                        
                        # Execute Wikipedia search
                        try:
                            search_results = wikipedia_api.search_and_get_wikipedia(query, max_pages)
                            wikipedia_content.update(search_results)
                            
                            # Format results for LLM (truncate long content)
                            results_text = "\n\n".join([
                                f"=== {title} ===\n{content[:2000]}..." if len(content) > 2000 else f"=== {title} ===\n{content}"
                                for title, content in search_results.items()
                            ])
                            
                            messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "content": f"Found {len(search_results)} Wikipedia page(s):\n\n{results_text}"
                            })
                        except Exception as e:
                            messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "content": f"Error searching Wikipedia: {str(e)}"
                            })
                
                # Get next response
                response = client.chat.completions.create(
                    model=MODEL_FOR_VALIDATION,
                    messages=messages,
                    tools=[wikipedia_tool],
                    tool_choice="auto",
                    temperature=0.1
                )
            
            # Extract final response content
            final_message = response.choices[0].message.content
        else:
            # No function calling, just regular completion
            response = client.chat.completions.create(
                model=MODEL_FOR_VALIDATION,
                messages=messages,
                temperature=0.1
            )
            final_message = response.choices[0].message.content
        
        # Parse JSON response
        result = json.loads(final_message)
        
        # Validate response structure
        if not isinstance(result, dict) or 'is_true' not in result or 'reasoning' not in result:
            raise ValueError("Invalid response format from validation model")
        
        if not isinstance(result['is_true'], bool):
            result['is_true'] = result['is_true'].lower() in ('true', '1', 'yes')
        
        # Add Wikipedia sources used if any
        if wikipedia_content:
            result['wikipedia_sources'] = list(wikipedia_content.keys())
        
        return result
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON response from validation model: {e}")
    except Exception as e:
        raise RuntimeError(f"Error during claim validation: {e}")

    
