#!/bin/bash

set -euo pipefail

PORT="${1:-3000}"
if [[ ! "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
    echo "Invalid port: $PORT"
    exit 1
fi
PIDS="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"

if [[ -z "$PIDS" ]]; then
    echo "No development server is listening on port $PORT."
    sleep 2
    exit 0
fi

echo "Stopping the development server on port $PORT..."
while IFS= read -r pid; do
    if [[ "$pid" =~ ^[0-9]+$ ]]; then
        kill "$pid" 2>/dev/null || true
    fi
done <<< "$PIDS"

sleep 1
REMAINING="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
if [[ -n "$REMAINING" ]]; then
    while IFS= read -r pid; do
        if [[ "$pid" =~ ^[0-9]+$ ]]; then
            kill -9 "$pid" 2>/dev/null || true
        fi
    done <<< "$REMAINING"
fi

echo "Done."
sleep 2
