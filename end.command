#!/bin/bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
PID_FILE="$PROJECT_DIR/.altool/dev-server.pid"
PORT="${1:-3000}"
if [[ ! "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
    echo "Invalid port: $PORT"
    exit 1
fi

if [[ ! -f "$PID_FILE" ]]; then
    echo "No Altool-managed development server PID was found. Nothing was stopped."
    if command -v lsof >/dev/null 2>&1; then
        echo "Listeners on port $PORT (information only):"
        lsof -nP -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || echo "  none"
    fi
    exit 1
fi

IFS= read -r PID < "$PID_FILE" || true
if [[ ! "$PID" =~ ^[0-9]+$ ]]; then
    echo "Invalid Altool PID file. Nothing was stopped: $PID_FILE"
    exit 1
fi
if ! kill -0 "$PID" 2>/dev/null; then
    rm -f "$PID_FILE"
    echo "The recorded process $PID is no longer running. Removed the stale PID file."
    exit 0
fi
if ! command -v lsof >/dev/null 2>&1; then
    echo "lsof is required to verify the recorded process working directory. Nothing was stopped."
    exit 1
fi

PROCESS_DIR="$(lsof -a -p "$PID" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -n 1)"
if [[ "$PROCESS_DIR" != "$PROJECT_DIR" ]]; then
    echo "Recorded PID $PID does not belong to this project. Nothing was stopped."
    exit 1
fi

TARGET_PIDS=()
collect_tree() {
    local parent_pid="$1"
    local child_pid
    while IFS= read -r child_pid; do
        if [[ "$child_pid" =~ ^[0-9]+$ ]]; then
            collect_tree "$child_pid"
        fi
    done < <(pgrep -P "$parent_pid" 2>/dev/null || true)
    TARGET_PIDS+=("$parent_pid")
}

echo "Stopping Altool-managed development server (PID $PID)..."
collect_tree "$PID"
for target_pid in "${TARGET_PIDS[@]}"; do
    kill "$target_pid" 2>/dev/null || true
done
sleep 1
for target_pid in "${TARGET_PIDS[@]}"; do
    if kill -0 "$target_pid" 2>/dev/null; then
        kill -9 "$target_pid" 2>/dev/null || true
    fi
done
rm -f "$PID_FILE"

echo "Done."
