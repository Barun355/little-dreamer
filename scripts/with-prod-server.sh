#!/usr/bin/env bash
# Build, serve a PRODUCTION build, run a command against it, then tear down.
#
# Exists because `pnpm start` spawns next-server as a grandchild: killing the
# wrapper PID orphans the server, which keeps holding port 3000. The next
# `pnpm start` then fails with EADDRINUSE while the harness happily measures
# the STALE server that is still up. Two phases of measurements were wrong
# before this was caught, so teardown is now explicit and verified.
#
# Usage: scripts/with-prod-server.sh node scripts/verify-phase-4.mjs
set -uo pipefail

PORT="${PORT:-3000}"
SKIP_BUILD="${SKIP_BUILD:-0}"

teardown() {
  pkill -f "next-server" >/dev/null 2>&1 || true
  pkill -f "next start"  >/dev/null 2>&1 || true
  pkill -f "next dev"    >/dev/null 2>&1 || true
  sleep 1
}

trap teardown EXIT

echo "── teardown any existing server"
teardown

for _ in $(seq 1 15); do
  if ss -ltn 2>/dev/null | grep -q ":${PORT}\b"; then sleep 1; else break; fi
done
if ss -ltn 2>/dev/null | grep -q ":${PORT}\b"; then
  echo "ABORT: port ${PORT} still occupied" >&2
  exit 2
fi
echo "── port ${PORT} free"

if [ "$SKIP_BUILD" != "1" ]; then
  echo "── clean build"
  rm -rf .next
  pnpm build 2>&1 | grep -E "Compiled|error|Error" || true
fi

echo "── start production server"
pnpm start >/tmp/ld-prod-server.log 2>&1 &

for _ in $(seq 1 90); do
  curl -sf "http://localhost:${PORT}" -o /dev/null && break
  sleep 1
done

if ! curl -sf "http://localhost:${PORT}" -o /dev/null; then
  echo "ABORT: server never became ready" >&2
  tail -20 /tmp/ld-prod-server.log >&2
  exit 2
fi

# Refuse to proceed against a dev build.
if curl -s "http://localhost:${PORT}" | grep -qE "__next_hmr|react-refresh"; then
  echo "ABORT: server is serving a DEV build" >&2
  exit 2
fi

echo "── serving production on :${PORT}"
echo

"$@"
