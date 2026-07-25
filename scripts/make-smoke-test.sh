#!/usr/bin/env bash
# End-to-end smoke test for the "Little Dream" Make scenario (6695966).
#
# The webhook enforces API-key auth (verified: 401 for both a missing and a
# wrong key), and the key value is not readable through the Make API — by
# design. So this has to be run by someone who holds it.
#
#   MAKE_API_KEY=<your key> bash scripts/make-smoke-test.sh
#
# Expect HTTP 202 immediately. The AI stages then run for ~2-4 minutes:
# story -> image prompts -> character reference -> 6 page illustrations.
set -euo pipefail

HOOK="https://hook.eu1.make.com/1hapzf9io1bpfnzqik2h4gf8hpfjcvga"
KEY="${MAKE_API_KEY:-}"

if [ -z "$KEY" ]; then
  echo "MAKE_API_KEY is not set." >&2
  echo "Find it in Make: the webhook's API-key auth, key 'little-dream-web' (206996)." >&2
  exit 1
fi

# A stock photo, deliberately NOT a child's image — this exercises the
# fetch -> editImage -> loop plumbing without putting a real minor's likeness
# through the pipeline. Swap for a real photo only when you mean to.
PHOTO="${PHOTO_URL:-https://picsum.photos/id/1005/512/512}"

read -r -d '' PAYLOAD <<JSON || true
{
  "jobId": "job_smoke_$(date +%s)",
  "seed": $RANDOM,
  "recommendedAgeGroup": "6-8",
  "audiencePreference": ["gentle", "funny"],
  "storyWorld": "Deep Space Frontier",
  "storyDirection": "an unlikely rescue mission",
  "possibleAdventures": [
    "repairing a broken satellite",
    "meeting a lost alien child",
    "navigating an asteroid field",
    "discovering a hidden moon base",
    "racing a comet",
    "befriending a space whale"
  ],
  "ending": "returns home a hero and sleeps under the stars",
  "storyTheme": "Space Explorer",
  "child": {
    "name": "Aarav",
    "age": 6,
    "gender": "boy",
    "images": ["$PHOTO"]
  },
  "emotionalTheme": ["courage", "friendship"],
  "callback": { "baseUrl": "" }
}
JSON

echo "POST $HOOK"
curl -sS -X POST "$HOOK" \
  -H "x-make-apikey: $KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -w "\n\nHTTP %{http_code}  (%{time_total}s)\n"

echo
echo "Now watch the run:  https://eu1.make.com/2123206/scenarios/6695966"
