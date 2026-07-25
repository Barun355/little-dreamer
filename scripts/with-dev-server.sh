#!/usr/bin/env bash
# Serve a DEV build, run a command against it, then tear down.
#
# Dev-only because React and Base UI strip their development warnings from
# production builds — a production run reports clean while the warnings are
# still firing for anyone working on the app.
#
# Teardown matches the node process by its binary path, NOT by the string
# "next dev": that pattern also matches this wrapper script's own shell, so
# `pkill -f "next dev"` kills the runner mid-flight (exit 144).
set -uo pipefail

PORT="${PORT:-3000}"

teardown() {
  pkill -f "next/dist/bin/next" >/dev/null 2>&1 || true
  pkill -f "next-server" >/dev/null 2>&1 || true
  sleep 1
}

trap teardown EXIT
teardown

for _ in $(seq 1 15); do
  ss -ltn 2>/dev/null | grep -q ":${PORT}\b" || break
  sleep 1
done

pnpm dev >/tmp/ld-dev-server.log 2>&1 &

for _ in $(seq 1 90); do
  curl -sf "http://localhost:${PORT}" -o /dev/null && break
  sleep 1
done

if ! curl -sf "http://localhost:${PORT}" -o /dev/null; then
  echo "ABORT: dev server never became ready" >&2
  tail -20 /tmp/ld-dev-server.log >&2
  exit 2
fi

echo "── dev server ready on :${PORT}"
echo

"$@"
