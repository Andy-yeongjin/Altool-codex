#!/bin/bash

set -euo pipefail

ALTOOL_DIR="$(cd "$(dirname "$0")" && pwd -P)"
PROJECT_DIR="${1:-}"
NONINTERACTIVE=0

if [[ -n "$PROJECT_DIR" ]]; then
    NONINTERACTIVE=1
fi

pause_on_exit() {
    local status=$?
    trap - EXIT
    if [[ "$NONINTERACTIVE" -eq 0 ]]; then
        printf '\nPress Return to close...'
        IFS= read -r _ || true
    fi
    exit "$status"
}
trap pause_on_exit EXIT

if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "This installer is for macOS. Use setup.bat on Windows."
    exit 1
fi
if ! command -v ditto >/dev/null 2>&1; then
    echo "Required macOS command not found: ditto"
    exit 1
fi
if [[ ! -f "$ALTOOL_DIR/altool/scripts/check.py" ]]; then
    echo "Altool gate missing: $ALTOOL_DIR/altool/scripts/check.py"
    exit 1
fi
if [[ ! -f "$ALTOOL_DIR/templates/codex/skills/altool/SKILL.md" ]]; then
    echo "Bundled Altool skill missing: $ALTOOL_DIR/templates/codex/skills/altool/SKILL.md"
    exit 1
fi

PYTHON_CMD=""
for candidate in python3 python; do
    if command -v "$candidate" >/dev/null 2>&1 \
        && "$candidate" -c 'import sys; raise SystemExit(sys.version_info.major != 3)' \
        && "$candidate" "$ALTOOL_DIR/altool/scripts/check.py" --help >/dev/null; then
        PYTHON_CMD="$candidate"
        break
    fi
done
if [[ -z "$PYTHON_CMD" ]]; then
    echo "Python 3 is required, and altool/scripts/check.py --help must run successfully."
    exit 1
fi

if [[ -z "$PROJECT_DIR" ]] && command -v osascript >/dev/null 2>&1; then
    if selected_dir="$(osascript 2>/dev/null <<'APPLESCRIPT'
POSIX path of (choose folder with prompt "Select your project folder")
APPLESCRIPT
    )"; then
        PROJECT_DIR="${selected_dir%/}"
    fi
fi

if [[ -z "$PROJECT_DIR" ]]; then
    printf '\nFolder selection was cancelled or unavailable.\n'
    printf 'Project folder path: '
    IFS= read -r PROJECT_DIR || true
fi

if [[ -z "$PROJECT_DIR" ]]; then
    echo "Cancelled."
    exit 0
fi

if [[ "$PROJECT_DIR" == "~" ]]; then
    PROJECT_DIR="$HOME"
elif [[ "$PROJECT_DIR" == "~/"* ]]; then
    PROJECT_DIR="$HOME/${PROJECT_DIR:2}"
fi

mkdir -p "$PROJECT_DIR"
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd -P)"

copy_if_missing() {
    local source_file="$1"
    local target_file="$2"
    local display_name="$3"

    if [[ ! -f "$source_file" ]]; then
        return
    fi
    if [[ -e "$target_file" ]]; then
        echo "  [KEEP] $display_name already exists"
    else
        cp "$source_file" "$target_file"
        echo "  [OK] $display_name"
    fi
}

replace_managed_dir() {
    local source_dir="$1"
    local target_dir="$2"
    local display_name="$3"

    if [[ ! -d "$source_dir" ]]; then
        echo "  [ERROR] Managed source missing: $source_dir"
        exit 1
    fi
    if [[ -L "$target_dir" ]]; then
        echo "  [ERROR] Refusing to replace symlinked managed directory: $target_dir"
        exit 1
    fi
    rm -rf "$target_dir"
    ditto "$source_dir" "$target_dir"
    echo "  [OK] $display_name"
}

extract_constitution_version() {
    sed -n 's/^\*\*Version\*\*:[[:space:]]*\([0-9][0-9.]*\).*/\1/p' "$1" | head -n 1
}

echo
echo "============================================="
echo "  Altool Project Setup (macOS)"
echo "============================================="
echo
echo "  Target: $PROJECT_DIR"
echo "  Python: $PYTHON_CMD"
echo
echo "  Copying files..."

replace_managed_dir "$ALTOOL_DIR/altool" "$PROJECT_DIR/altool" "altool/ (engine)"

copy_if_missing "$ALTOOL_DIR/AGENTS.md" "$PROJECT_DIR/AGENTS.md" "AGENTS.md"

mkdir -p "$PROJECT_DIR/.agents/skills"
if [[ -d "$ALTOOL_DIR/templates/codex/skills" ]]; then
    shopt -s nullglob
    for skill_dir in "$ALTOOL_DIR"/templates/codex/skills/*; do
        if [[ -d "$skill_dir" && -f "$skill_dir/SKILL.md" ]]; then
            skill_name="$(basename "$skill_dir")"
            replace_managed_dir \
                "$skill_dir" \
                "$PROJECT_DIR/.agents/skills/$skill_name" \
                "Codex local skill: $skill_name"
        fi
    done
    shopt -u nullglob
else
    echo "  [WARN] Codex skill templates missing: templates/codex/skills"
fi

copy_if_missing "$ALTOOL_DIR/constitution.md" "$PROJECT_DIR/constitution.md" "constitution.md"

if [[ ! -f "$ALTOOL_DIR/constitution.md" ]]; then
    echo "  [WARN] Engine constitution missing - version check skipped"
else
    engine_version="$(extract_constitution_version "$ALTOOL_DIR/constitution.md")"
    project_version=""
    if [[ -f "$PROJECT_DIR/constitution.md" ]]; then
        project_version="$(extract_constitution_version "$PROJECT_DIR/constitution.md")"
    fi

    if [[ -z "$engine_version" ]]; then
        echo "  [WARN] Engine constitution has no Version marker - version check skipped"
    else
        engine_major="${engine_version%%.*}"
        if [[ -z "$project_version" ]]; then
            echo "  [WARN] constitution.md has no Version marker - engine expects major $engine_major.x"
        else
            project_major="${project_version%%.*}"
            if [[ "$project_major" != "$engine_major" ]]; then
                echo "  [WARN] constitution.md is v$project_version - engine expects major $engine_major.x; review before running \$altool"
            else
                echo "  [OK] constitution.md version compatible: v$project_version"
            fi
        fi
    fi
fi

mkdir -p "$PROJECT_DIR/designs/claude-design"
echo "  [OK] designs/claude-design/ (Claude design HTML folder)"
copy_if_missing "$ALTOOL_DIR/designs/design.md" "$PROJECT_DIR/designs/design.md" "designs/design.md"

mkdir -p "$PROJECT_DIR/prd"
echo "  [OK] prd/ (folder)"

for launcher in start.command end.command; do
    if [[ -f "$ALTOOL_DIR/$launcher" ]]; then
        cp -f "$ALTOOL_DIR/$launcher" "$PROJECT_DIR/$launcher"
        chmod +x "$PROJECT_DIR/$launcher"
        echo "  [OK] $launcher"
    fi
done

if [[ ! -e "$PROJECT_DIR/.gitignore" ]]; then
    printf '%s\n' \
        '# Altool state' \
        '.altool/' \
        '' \
        '# Node' \
        'node_modules/' \
        '.next/' \
        '' \
        '# Python' \
        '__pycache__/' \
        '' \
        '# OS' \
        '.DS_Store' \
        'Thumbs.db' \
        '' \
        '# Env / secrets' \
        '.env' \
        '.env*.local' \
        '' \
        '# Local DB' \
        '*.db' \
        '*.db-journal' \
        '' \
        '# Codex repo-local skills' \
        '!.agents/' \
        '' \
        '# Local browser/test artifacts' \
        '.playwright-mcp/' > "$PROJECT_DIR/.gitignore"
    echo "  [OK] .gitignore created"
else
    echo "  [SKIP] .gitignore exists - add '.altool/' manually if needed"
fi

echo
echo "============================================="
echo "  Done!"
echo "============================================="
echo
echo "  1. Open Codex"
echo "  2. Open folder: $PROJECT_DIR"
echo "  3. Restart Codex or open a new chat if the skill does not appear"
echo "  4. Type:  \$altool setup"
echo
