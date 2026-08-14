#!/bin/bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
cd "$PROJECT_DIR"

if [[ ! -f package.json ]]; then
    echo "No package.json found. This launcher only starts projects with an npm dev script."
    exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to run this project's dev script."
    exit 1
fi
DEV_SCRIPT="$(npm pkg get scripts.dev --json 2>/dev/null || true)"
if [[ -z "$DEV_SCRIPT" || "$DEV_SCRIPT" == "null" || "$DEV_SCRIPT" == "{}" ]]; then
    echo "package.json has no scripts.dev entry. Start the project with its stack-specific command."
    exit 1
fi

mkdir -p .altool
printf '%s\n' "$$" > .altool/dev-server.pid
exec npm run dev
