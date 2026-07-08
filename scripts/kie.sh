#!/usr/bin/env bash
# kie.sh — portable kie.ai REST wrapper for the scroll-hero pipeline.
# NO MCP required. Set KIE_API_KEY in your shell env or in a .env file at the kit root.
#
# Usage:
#   scripts/kie.sh submit '{"model":"nano-banana-2","input":{...}}'   -> prints the taskId
#   scripts/kie.sh get <taskId>                                        -> raw status JSON
#   scripts/kie.sh wait <taskId> [taskId ...]                          -> polls until done,
#                                                                         prints: RESULT <id> <state> <url|failMsg>
#   scripts/kie.sh download <url> <destPath>
#
# The consistency chain and Seedance refs reuse the URLs kie RETURNS, so no upload is needed.
set -euo pipefail
BASE="https://api.kie.ai"

load_key() {
  if [ -n "${KIE_API_KEY:-}" ]; then return; fi
  local dir; dir="$(cd "$(dirname "$0")/.." && pwd)"
  for f in "$dir/.env" "$dir/../.env" "./.env"; do
    if [ -f "$f" ]; then
      # shellcheck disable=SC2046
      KIE_API_KEY="$(grep -E '^KIE_API_KEY=' "$f" | head -1 | cut -d= -f2- | tr -d '"'"'"' \r')"
      [ -n "${KIE_API_KEY:-}" ] && export KIE_API_KEY && return
    fi
  done
  echo "ERROR: KIE_API_KEY not set. Add it to your .env (see .env.example) or export it." >&2
  exit 1
}

cmd="${1:-}"; shift || true
load_key

case "$cmd" in
  submit)
    body="${1:?submit needs a JSON body}"
    resp="$(curl -s -X POST "$BASE/api/v1/jobs/createTask" \
      -H "Authorization: Bearer $KIE_API_KEY" -H "Content-Type: application/json" -d "$body")"
    echo "$resp" | python3 -c 'import sys,json;d=json.load(sys.stdin);
tid=(d.get("data") or {}).get("taskId");
print(tid) if tid else sys.exit("submit failed: "+json.dumps(d))'
    ;;
  get)
    tid="${1:?get needs a taskId}"
    curl -s "$BASE/api/v1/jobs/recordInfo?taskId=$tid" -H "Authorization: Bearer $KIE_API_KEY"
    ;;
  wait)
    [ $# -ge 1 ] || { echo "wait needs at least one taskId" >&2; exit 64; }
    KEY="$KIE_API_KEY" BASE="$BASE" python3 - "$@" <<'PY'
import json,os,sys,time,urllib.request
KEY,BASE=os.environ['KEY'],os.environ['BASE']
tasks=sys.argv[1:]; done={}
def check(t):
    req=urllib.request.Request(f"{BASE}/api/v1/jobs/recordInfo?taskId={t}",headers={'Authorization':f'Bearer {KEY}'})
    try: d=(json.load(urllib.request.urlopen(req,timeout=20)).get('data') or {})
    except Exception: return ('unknown','-')
    s=d.get('state','unknown')
    if s=='success':
        try: return ('success', json.loads(d.get('resultJson') or '{}')['resultUrls'][0])
        except Exception: return ('success','-')
    if s=='fail': return ('fail', d.get('failMsg','failed'))
    return (s,'-')
deadline=time.time()+2700
while time.time()<deadline:
    for t in tasks:
        if t in done: continue
        st,info=check(t)
        if st in ('success','fail'): done[t]=(st,info); print(f"RESULT {t} {st} {info}",flush=True)
    if len(done)==len(tasks): break
    time.sleep(20)
sys.exit(0 if all(v[0]=='success' for v in done.values()) else 1)
PY
    ;;
  download)
    url="${1:?download needs a url}"; dest="${2:?download needs a destPath}"
    mkdir -p "$(dirname "$dest")"; curl -s -L "$url" -o "$dest"; echo "saved $dest"
    ;;
  *)
    echo "usage: kie.sh {submit <json>|get <taskId>|wait <taskId...>|download <url> <dest>}" >&2; exit 64;;
esac
