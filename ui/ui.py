import os
import httpx
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

AGENT_URL = os.environ.get(
    "AGENT_ENDPOINT_URL",
    "https://endpoint-ab2f4a3f-7701-4fcb-85f2-e94ff0d6d633.agentbase-runtime.aiplatform.vngcloud.vn",
)

st.set_page_config(page_title="Mock Interviewer", page_icon="🤖", layout="centered")
st.title("🤖 Software Engineering Mock Interviewer")
st.caption("6 questions · Easy → Hard · Instant feedback on each answer")


def call_agent(messages: list) -> dict:
    try:
        resp = httpx.post(f"{AGENT_URL}/chat", json={"messages": messages}, timeout=60)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"response": f"⚠️ Error: {e}", "is_complete": False}


if "messages" not in st.session_state:
    st.session_state.messages = []
    st.session_state.is_complete = False
    init = [{"role": "user", "content": "Hi, I'm ready to start the interview."}]
    with st.spinner("Starting interview..."):
        data = call_agent(init)
    st.session_state.messages = init + [{"role": "assistant", "content": data["response"]}]
    st.session_state.is_complete = data.get("is_complete", False)

for msg in st.session_state.messages[1:]:
    avatar = "🤖" if msg["role"] == "assistant" else "👤"
    with st.chat_message(msg["role"], avatar=avatar):
        st.markdown(msg["content"])

if st.session_state.is_complete:
    st.success("🎉 Interview complete! Review your results above.")
    if st.button("🔄 Start New Interview"):
        del st.session_state.messages
        del st.session_state.is_complete
        st.rerun()
else:
    if user_input := st.chat_input("Type your answer here..."):
        st.session_state.messages.append({"role": "user", "content": user_input})
        with st.chat_message("user", avatar="👤"):
            st.markdown(user_input)

        with st.chat_message("assistant", avatar="🤖"):
            with st.spinner("Thinking..."):
                data = call_agent(st.session_state.messages)
            response = data["response"]
            st.markdown(response)

        st.session_state.messages.append({"role": "assistant", "content": response})
        st.session_state.is_complete = data.get("is_complete", False)
        st.rerun()