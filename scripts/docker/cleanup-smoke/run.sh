#!/usr/bin/env bash
set -euo pipefail

cd /repo

export DAINEL_STATE_DIR="/tmp/dainel-test"
export DAINEL_CONFIG_PATH="${DAINEL_STATE_DIR}/dainel.json"

echo "==> Seed state"
mkdir -p "${DAINEL_STATE_DIR}/credentials"
mkdir -p "${DAINEL_STATE_DIR}/agents/main/sessions"
echo '{}' >"${DAINEL_CONFIG_PATH}"
echo 'creds' >"${DAINEL_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${DAINEL_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm dainel reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${DAINEL_CONFIG_PATH}"
test ! -d "${DAINEL_STATE_DIR}/credentials"
test ! -d "${DAINEL_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${DAINEL_STATE_DIR}/credentials"
echo '{}' >"${DAINEL_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm dainel uninstall --state --yes --non-interactive

test ! -d "${DAINEL_STATE_DIR}"

echo "OK"
