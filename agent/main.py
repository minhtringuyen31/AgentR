import sys
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are Alex, a senior software engineering interviewer at a top-tier tech company with 15 years of experience. Your job is to conduct a 6-question technical interview for a Software Engineering position.

## Interview Structure

**Question 1/6 — Easy:** A basic data structure or CS concept question.
**Question 2/6 — Easy-Medium:** Time/space complexity or a simple algorithm question.
**Question 3/6 — Medium:** Array, string, or tree/graph problem.
**Question 4/6 — Medium-Hard:** Dynamic programming or recursion problem.
**Question 5/6 — Hard:** System design (e.g., design a URL shortener, rate limiter, chat system).
**Question 6/6 — Hard:** Advanced algorithm trade-offs or a follow-up on the system design.

## After Each Answer

Respond with:
1. A brief acknowledgment of their answer
2. **✅ Strengths:** what they got right
3. **💡 To improve:** specific gaps or missing points
4. **📊 Score: X/10** for this answer
5. Transition to the next question (or final evaluation if done)

## Final Evaluation (after Question 6)

```
## Interview Complete!

**Overall Score: X.X/10**
**Recommendation: Strong Hire | Hire | Borderline | No Hire**

### Strengths
- ...

### Areas to Improve
- ...

### Recommended Study Topics
- ...
```

## Rules
- Ask ONE question at a time, always labeled **"Question N/6:"**
- If candidate says "skip" or "I don't know": briefly explain the model answer, give 0/10, and move on
- Be professional, encouraging, and specific in feedback
- Do not reveal future questions in advance
"""


def get_client() -> OpenAI:
    api_key = os.environ.get("LLM_API_KEY") or os.environ.get("AIP_API_KEY")
    if not api_key:
        print("Error: LLM_API_KEY not set in .env")
        sys.exit(1)
    base_url = os.environ.get("LLM_BASE_URL")
    if not base_url:
        print("Error: LLM_BASE_URL not set in .env")
        sys.exit(1)
    return OpenAI(api_key=api_key, base_url=base_url)


def stream_response(client: OpenAI, messages: list) -> str:
    model = os.environ.get("LLM_MODEL", "")
    if not model:
        print("Error: LLM_MODEL not set in .env")
        sys.exit(1)

    all_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
    full_response = ""

    stream = client.chat.completions.create(
        model=model,
        max_tokens=2048,
        messages=all_messages,
        stream=True,
    )
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content is not None:
            text = chunk.choices[0].delta.content
            print(text, end="", flush=True)
            full_response += text
    return full_response


def is_interview_complete(response: str) -> bool:
    markers = ["recommendation:", "## interview complete", "overall score:"]
    lower = response.lower()
    return any(m in lower for m in markers)


def main():
    client = get_client()
    messages: list[dict] = []

    print()
    print("=" * 64)
    print("        SOFTWARE ENGINEERING MOCK INTERVIEWER")
    print("=" * 64)
    print("  Answer each question as you would in a real interview.")
    print("  Type 'skip' to skip, 'quit' to exit early.")
    print("=" * 64)
    print()

    messages.append({
        "role": "user",
        "content": "Hi, I'm ready to start the interview.",
    })

    while True:
        print("Interviewer: ", end="", flush=True)
        response = stream_response(client, messages)
        print("\n")

        messages.append({"role": "assistant", "content": response})

        if is_interview_complete(response):
            print("=" * 64)
            print("  Interview complete! Good luck with your job search!")
            print("=" * 64)
            break

        try:
            user_input = input("You: ").strip()
            print()
        except (EOFError, KeyboardInterrupt):
            print("\n\nInterview ended. Thanks for practicing!")
            sys.exit(0)

        if user_input.lower() == "quit":
            print("Interview ended early. Keep practicing!")
            sys.exit(0)

        messages.append({
            "role": "user",
            "content": user_input or "(no response)",
        })


if __name__ == "__main__":
    main()