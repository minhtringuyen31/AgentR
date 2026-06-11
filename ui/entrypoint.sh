#!/bin/bash
set -e

uv run streamlit run ui.py \
  --server.port 8501 \
  --server.address 0.0.0.0 \
  --browser.gatherUsageStats false &

nginx -g 'daemon off;'