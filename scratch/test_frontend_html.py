import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

try:
    req = urllib.request.Request("http://localhost:3000", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=5) as resp:
        html = resp.read().decode('utf-8')
        print(f"HTTP Status: {resp.status}")
        print(f"HTML size: {len(html)} bytes")

        # Verify key features in HTML output
        features = [
            ("MAUSAM", "MAUSAM Brand"),
            ("Help &amp; Report", "Help & Report Button (HTML encoded)"),
            ("VayuSync", "VayuSync Intelligence Tag"),
            ("National Weather Service", "Portal Subtitle")
        ]

        for text, desc in features:
            if text in html:
                print(f"✓ Found: {desc} ('{text}')")
            else:
                print(f"✗ Not found in initial SSR HTML: {desc} ('{text}')")

except Exception as e:
    print("Error fetching frontend:", e)
