#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
cd "$PROJECT_DIR"
exec npm run dev
