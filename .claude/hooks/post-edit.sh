#!/bin/bash
# 파일 편집 후 ESLint fix + Prettier 자동 적용

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# ts/tsx/js/jsx 파일만 대상
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" || exit 1

# ESLint fix + Prettier
npx eslint --fix "$FILE_PATH" 2>&1 | grep -E "error|warning" >&2
npx prettier --write "$FILE_PATH" 2>/dev/null

exit 0
