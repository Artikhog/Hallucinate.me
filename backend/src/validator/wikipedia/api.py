import wikipediaapi
from typing import List, Dict, Optional

USER_AGENT = "LLMHallucinationValidator/1.0 (https://github.com/Artikhog/Hallucinate.me)"

wikipedia = wikipediaapi.Wikipedia(
    language="en",
    extract_format=wikipediaapi.ExtractFormat.WIKI,
    user_agent=USER_AGENT,
)


def get_wikipedia_page(page_name: str) -> str:
    """Get the full text content of a Wikipedia page."""
    page = wikipedia.page(page_name)
    if page.exists():
        return page.text.strip().replace('\n', ' ')
    else:
        raise ValueError(f"Page {page_name} does not exist")


def search_wikipedia(query: str, limit: int = 10) -> List[str]:
    """
    Search Wikipedia for pages matching the query.
    
    Args:
        query: Search query string
        limit: Maximum number of results to return (default: 10)
        
    Returns:
        List of Wikipedia page titles matching the query
    """
    search_results = wikipedia.search(query, results=limit)
    # wikipediaapi.search() returns a list of strings (page titles)
    return list(search_results[:limit])


def search_and_get_wikipedia(query: str, max_pages: int = 3) -> Dict[str, str]:
    """
    Search Wikipedia and retrieve content from the top matching pages.
    Useful for LLM tools to automatically find relevant Wikipedia content.
    
    Args:
        query: Search query string
        max_pages: Maximum number of pages to retrieve content from (default: 3)
        
    Returns:
        Dictionary mapping page titles to their content
    """
    page_titles = search_wikipedia(query, limit=max_pages)
    results = {}
    
    for title in page_titles:
        try:
            content = get_wikipedia_page(title)
            results[title] = content
        except Exception as e:
            # Skip pages that fail to load
            print(f"Warning: Could not fetch Wikipedia page '{title}': {e}")
            continue
    
    return results


def get_wikipedia_tool_definition() -> Dict:
    """
    Get the OpenAI function/tool definition for Wikipedia search.
    This can be used with OpenAI's function calling feature.
    
    Returns:
        Dictionary containing the tool definition for OpenAI API
    """
    return {
        "type": "function",
        "function": {
            "name": "search_wikipedia",
            "description": "Search Wikipedia for information about a topic. Returns a list of relevant Wikipedia page titles that can be used to verify claims or gather factual information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query to find relevant Wikipedia pages. Should be a clear topic or subject name (e.g., 'Albert Einstein', 'Quantum mechanics', 'World War II')."
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of search results to return. Default is 5.",
                        "default": 5,
                        "minimum": 1,
                        "maximum": 10
                    }
                },
                "required": ["query"]
            }
        }
    }


def get_wikipedia_content_tool_definition() -> Dict:
    """
    Get the OpenAI function/tool definition for searching and retrieving Wikipedia content.
    This tool searches Wikipedia and automatically retrieves the content from top results.
    
    Returns:
        Dictionary containing the tool definition for OpenAI API
    """
    return {
        "type": "function",
        "function": {
            "name": "search_and_get_wikipedia_content",
            "description": "Search Wikipedia for a topic and automatically retrieve the full content from the most relevant pages. Use this when you need to verify factual claims or gather detailed information about a subject.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query describing the topic you want to research. Be specific and clear (e.g., 'Einstein theory of relativity', 'Python programming language history', 'COVID-19 pandemic')."
                    },
                    "max_pages": {
                        "type": "integer",
                        "description": "Maximum number of Wikipedia pages to retrieve content from. Default is 3.",
                        "default": 3,
                        "minimum": 1,
                        "maximum": 5
                    }
                },
                "required": ["query"]
            }
        }
    }