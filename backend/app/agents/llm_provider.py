import httpx
from app.config import settings

class LLMProvider:
    def __init__(self):
        self.configured = settings.AI_PROVIDER != 'none' and bool(settings.AI_API_KEY)
    
    async def generate(self, prompt: str, context: dict) -> str:
        if not self.configured:
            return None
        
        if settings.AI_PROVIDER == 'openai':
            async with httpx.AsyncClient() as client:
                try:
                    # Dummy implementation for openai.
                    # response = await client.post(...)
                    return None 
                except Exception:
                    return None
        return None
