# ai-service/scripts/healthcheck.py
import sys
import urllib.request

try:
    url = f"http://localhost:{__import__('os').environ.get('PORT', 8000)}/health"
    req = urllib.request.urlopen(url, timeout=3)
    if req.status == 200:
        sys.exit(0)
    else:
        sys.exit(1)
except Exception:
    sys.exit(1)