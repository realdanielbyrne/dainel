#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="${DAINEL_IMAGE:-dainel:local}"
CONFIG_DIR="${DAINEL_CONFIG_DIR:-$HOME/.dainel}"
WORKSPACE_DIR="${DAINEL_WORKSPACE_DIR:-$HOME/clawd}"
PROFILE_FILE="${DAINEL_PROFILE_FILE:-$HOME/.profile}"

PROFILE_MOUNT=()
if [[ -f "$PROFILE_FILE" ]]; then
  PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
fi

echo "==> Build image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$ROOT_DIR"

echo "==> Run live model tests (profile keys)"
docker run --rm -t \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NODE_OPTIONS=--disable-warning=ExperimentalWarning \
  -e DAINEL_LIVE_TEST=1 \
  -e DAINEL_LIVE_MODELS="${DAINEL_LIVE_MODELS:-all}" \
  -e DAINEL_LIVE_PROVIDERS="${DAINEL_LIVE_PROVIDERS:-}" \
  -e DAINEL_LIVE_MODEL_TIMEOUT_MS="${DAINEL_LIVE_MODEL_TIMEOUT_MS:-}" \
  -e DAINEL_LIVE_REQUIRE_PROFILE_KEYS="${DAINEL_LIVE_REQUIRE_PROFILE_KEYS:-}" \
  -v "$CONFIG_DIR":/home/node/.dainel \
  -v "$WORKSPACE_DIR":/home/node/clawd \
  "${PROFILE_MOUNT[@]}" \
  "$IMAGE_NAME" \
  -lc "set -euo pipefail; [ -f \"$HOME/.profile\" ] && source \"$HOME/.profile\" || true; cd /app && pnpm test:live"
