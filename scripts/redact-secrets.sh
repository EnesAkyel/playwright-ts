#!/usr/bin/env bash
# Strips known secret values out of Playwright's HTML report / trace / test-results
# before they're uploaded as CI artifacts. Playwright records the literal arguments
# passed to page.fill() (and DOM snapshot values) inside trace.zip, and the HTML
# report embeds a copy of that trace - so a login test's password ends up in
# plaintext in an otherwise "safe" downloadable artifact unless it's scrubbed here.
#
# Usage: SECRETS="value1 value2" ./scripts/redact-secrets.sh dir1 [dir2 ...]
# Secrets come from the SECRETS env var (space-separated) so nothing sensitive is
# ever a CLI argument (which would show up in process listings / shell history).

set -euo pipefail

if [ -z "${SECRETS:-}" ]; then
  echo "redact-secrets: no SECRETS provided, nothing to do"
  exit 0
fi

targets=("$@")
if [ ${#targets[@]} -eq 0 ]; then
  echo "redact-secrets: usage: SECRETS=\"...\" $0 <dir> [dir ...]"
  exit 1
fi

redact_text_file() {
  local file="$1"
  for secret in $SECRETS; do
    # Skip trivially short values - redacting them would corrupt unrelated content
    if [ ${#secret} -lt 4 ]; then
      continue
    fi
    perl -i -pe "s/\Q${secret}\E/[REDACTED]/g" "$file" 2>/dev/null || true
  done
}

redact_zip() {
  local zip="$1"
  local zip_abs workdir
  zip_abs="$(cd "$(dirname "$zip")" && pwd)/$(basename "$zip")"
  workdir="$(mktemp -d)"
  unzip -o -q "$zip_abs" -d "$workdir"
  while IFS= read -r -d '' file; do
    if file -b "$file" | grep -qiE 'text|json|ASCII|UTF-8'; then
      redact_text_file "$file"
    fi
  done < <(find "$workdir" -type f -print0)
  (cd "$workdir" && zip -q -r -X "$zip_abs.new" .)
  mv "$zip_abs.new" "$zip_abs"
  rm -rf "$workdir"
}

count_zip=0
count_text=0

for dir in "${targets[@]}"; do
  [ -d "$dir" ] || continue

  while IFS= read -r -d '' zip; do
    redact_zip "$zip"
    count_zip=$((count_zip + 1))
  done < <(find "$dir" -type f -iname '*.zip' -print0)

  while IFS= read -r -d '' file; do
    if file -b "$file" | grep -qiE 'text|json|html|ASCII|UTF-8'; then
      redact_text_file "$file"
      count_text=$((count_text + 1))
    fi
  done < <(find "$dir" -type f ! -iname '*.zip' -print0)
done

echo "redact-secrets: scrubbed $count_zip archive(s) and checked $count_text other file(s) under: ${targets[*]}"
