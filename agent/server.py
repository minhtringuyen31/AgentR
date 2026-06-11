import os
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

from main import SYSTEM_PROMPT

load_dotenv()

app = FastAPI()


def get_client() -> OpenAI:
    api_key = os.environ.get("LLM_API_KEY") or os.environ.get("AIP_API_KEY")
    base_url = os.environ.get("LLM_BASE_URL")
    return OpenAI(api_key=api_key, base_url=base_url)


class ChatRequest(BaseModel):
    messages: list[dict]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat")
def chat(req: ChatRequest):
    model = os.environ.get("LLM_MODEL", "")
    if not model:
        return {"error": "LLM_MODEL not set"}

    client = get_client()
    all_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + req.messages

    completion = client.chat.completions.create(
        model=model,
        max_tokens=2048,
        messages=all_messages,
    )

    response = completion.choices[0].message.content
    markers = ["recommendation:", "## interview complete", "overall score:"]
    is_complete = any(m in response.lower() for m in markers)

    return {"response": response, "is_complete": is_complete}