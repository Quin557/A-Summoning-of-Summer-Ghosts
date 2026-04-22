#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_JSON="$ROOT_DIR/reports/asset-audit.json"
OUTPUT_DIR="$ROOT_DIR/.asset-cache/optimized"
LIMIT="${LIMIT:-20}"
VOICE_LIMIT="${VOICE_LIMIT:-40}"
IMG_MAX_DIM="${IMG_MAX_DIM:-1920}"
IMG_QUALITY="${IMG_QUALITY:-70}"
BGM_BITRATE="${BGM_BITRATE:-112k}"
VOICE_BITRATE="${VOICE_BITRATE:-80k}"
APPLY="${APPLY:-0}"

cd "$ROOT_DIR"

python3 scripts/asset_audit.py >/dev/null

IMG_TOOL=""
AUDIO_TOOL=""

if command -v sips >/dev/null 2>&1; then
  IMG_TOOL="sips"
elif command -v pngquant >/dev/null 2>&1; then
  IMG_TOOL="pngquant"
fi

if command -v ffmpeg >/dev/null 2>&1; then
  AUDIO_TOOL="ffmpeg"
fi

if [[ -z "$IMG_TOOL" && -z "$AUDIO_TOOL" ]]; then
  echo "Missing required tools."
  echo "Need at least one image tool (sips/pngquant) or one audio tool (ffmpeg)."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

resolve_dst() {
  local src="$1"
  local kind="$2"
  if [[ "$APPLY" == "1" ]]; then
    case "$kind" in
      img) echo "${src%.png}.jpg" ;;
      bgm|voice) echo "${src%.mp3}.m4a" ;;
    esac
  else
    case "$kind" in
      img) echo "$OUTPUT_DIR/${src%.png}.jpg" ;;
      bgm|voice) echo "$OUTPUT_DIR/${src%.mp3}.m4a" ;;
    esac
  fi
}

python3 - "$REPORT_JSON" "$LIMIT" "$VOICE_LIMIT" <<'PY' | while IFS=$'\t' read -r kind src; do
import json, sys
report_path = sys.argv[1]
limit = int(sys.argv[2])
voice_limit = int(sys.argv[3])
data = json.loads(open(report_path, encoding="utf-8").read())

img_candidates = [
    item for item in data["top_referenced_img"]
    if item["path"].startswith("assets/img/bgr/") and item["path"].lower().endswith(".png")
][:limit]
bgm_candidates = [
    item for item in data["top_referenced_bgm"]
    if item["path"].lower().endswith(".mp3")
][:limit]
voice_candidates = [
    item for item in data["top_referenced_voice"]
    if item["path"].lower().endswith(".mp3")
][:voice_limit]

for item in img_candidates:
    print("img", item["path"], sep="\t")
for item in bgm_candidates:
    print("bgm", item["path"], sep="\t")
for item in voice_candidates:
    print("voice", item["path"], sep="\t")
PY
  dst="$(resolve_dst "$src" "$kind")"
  mkdir -p "$(dirname "$dst")"

  if [[ "$kind" == "img" ]]; then
    if [[ "$IMG_TOOL" == "sips" ]]; then
      sips -s format jpeg -s formatOptions "$IMG_QUALITY" -Z "$IMG_MAX_DIM" "$src" --out "$dst" >/dev/null
    else
      pngquant --force --output "$dst" --quality=65-82 --speed 1 -- "$src"
    fi
  else
    if [[ -z "$AUDIO_TOOL" ]]; then
      echo "skip audio (ffmpeg missing): $src"
      continue
    fi
    bitrate="$BGM_BITRATE"
    [[ "$kind" == "voice" ]] && bitrate="$VOICE_BITRATE"
    ffmpeg -y -i "$src" -vn -c:a aac -b:a "$bitrate" "$dst" </dev/null >/dev/null 2>&1
  fi
  echo "optimized: ${dst#$ROOT_DIR/}"
done

echo
if [[ "$APPLY" == "1" ]]; then
  echo "Optimized adjacent variants generated in assets/ (jpg/m4a)."
else
  echo "Optimized assets written to: $OUTPUT_DIR"
fi
echo "Review playback and visual quality after QA."
