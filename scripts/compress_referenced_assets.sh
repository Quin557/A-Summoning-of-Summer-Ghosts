#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_JSON="$ROOT_DIR/reports/asset-audit.json"
OUTPUT_DIR="$ROOT_DIR/.asset-cache/optimized"
LIMIT="${LIMIT:-20}"

cd "$ROOT_DIR"

python3 scripts/asset_audit.py >/dev/null

if ! command -v pngquant >/dev/null 2>&1 || ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Missing required tools."
  echo "Install at least: pngquant, ffmpeg"
  echo "Then rerun: LIMIT=20 bash scripts/compress_referenced_assets.sh"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

python3 - "$REPORT_JSON" "$LIMIT" <<'PY' | while IFS=$'\t' read -r kind src rel; do
import json, sys
report_path = sys.argv[1]
limit = int(sys.argv[2])
data = json.loads(open(report_path, encoding="utf-8").read())

img_candidates = [
    item for item in data["top_referenced_img"]
    if item["path"].startswith("assets/img/bgr/") and item["path"].lower().endswith(".png")
][:limit]
bgm_candidates = data["top_referenced_bgm"][:limit]
voice_candidates = data["top_referenced_voice"][:limit]

for item in img_candidates:
    print("img", item["path"], item["path"], sep="\t")
for item in bgm_candidates:
    print("audio", item["path"], item["path"], sep="\t")
for item in voice_candidates:
    print("audio", item["path"], item["path"], sep="\t")
PY
  dst="$OUTPUT_DIR/$rel"
  mkdir -p "$(dirname "$dst")"
  if [[ "$kind" == "img" ]]; then
    pngquant --force --output "$dst" --quality=65-82 --speed 1 -- "$src"
  else
    ffmpeg -y -i "$src" -codec:a libmp3lame -b:a 112k "$dst" </dev/null >/dev/null 2>&1
  fi
  echo "optimized: $rel"
done

echo
echo "Optimized assets written to: $OUTPUT_DIR"
echo "Review diffs and replace selectively after QA."
