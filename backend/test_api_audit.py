import urllib.request, json, time

BASE = 'http://localhost:8000'
results = []

def req_get(url, timeout=12):
    r = urllib.request.urlopen(url, timeout=timeout)
    return json.loads(r.read())

def req_post(url, payload, timeout=12):
    data = json.dumps(payload).encode()
    r = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    resp = urllib.request.urlopen(r, timeout=timeout)
    return json.loads(resp.read())

def test(label, fn):
    try:
        start = time.time()
        result = fn()
        ms = round((time.time()-start)*1000)
        results.append(f'PASS [{ms}ms] {label}')
        return result
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:200]
        results.append(f'FAIL {label}: HTTP {e.code} - {body}')
        return None
    except Exception as e:
        results.append(f'FAIL {label}: {e}')
        return None

# 1. Root & Health
test('GET /', lambda: req_get(f'{BASE}/'))
test('GET /health', lambda: req_get(f'{BASE}/health'))
test('GET /api/v1/health', lambda: req_get(f'{BASE}/api/v1/health'))

# 2. Cities
test('GET /api/v1/weather/cities', lambda: req_get(f'{BASE}/api/v1/weather/cities'))
test('GET /api/v1/weather/reverse-geocode (Pune)', lambda: req_get(f'{BASE}/api/v1/weather/reverse-geocode?lat=18.5204&lon=73.8567'))

# 3. Weather - Mock scenarios
w_mock = test('GET /api/v1/weather (mock, Pune)', lambda: req_get(f'{BASE}/api/v1/weather?lat=18.5204&lon=73.8567&city_name=Pune&provider=mock'))
test('GET /api/v1/weather (mock, Mumbai Monsoon)', lambda: req_get(f'{BASE}/api/v1/weather?lat=19.0760&lon=72.8777&city_name=Mumbai&provider=mock&scenario=mumbai_monsoon'))
test('GET /api/v1/weather (mock, Delhi Smog)', lambda: req_get(f'{BASE}/api/v1/weather?lat=28.6139&lon=77.2090&city_name=Delhi&provider=mock&scenario=delhi_smog'))
test('GET /api/v1/weather (mock, Rajasthan Heatwave)', lambda: req_get(f'{BASE}/api/v1/weather?lat=26.9124&lon=75.7873&city_name=Jaipur&provider=mock&scenario=rajasthan_heatwave'))
test('GET /api/v1/weather (mock, Chennai Cyclone)', lambda: req_get(f'{BASE}/api/v1/weather?lat=13.0827&lon=80.2707&city_name=Chennai&provider=mock&scenario=chennai_cyclone'))

# 4. Weather - Live Open-Meteo
w_live = test('GET /api/v1/weather (open_meteo, Pune)', lambda: req_get(f'{BASE}/api/v1/weather?lat=18.5204&lon=73.8567&city_name=Pune&provider=open_meteo'))

# 5. Intelligence
base_ctx = {
    'name': 'TestUser',
    'is_personalized': True,
    'interests': ['running', 'health'],
    'priorities': ['rain', 'aqi'],
    'calendar_events': []
}
if w_mock:
    intel = test('POST /api/v1/intelligence/summary', lambda: req_post(f'{BASE}/api/v1/intelligence/summary', {'weather': w_mock, 'context': base_ctx}))
    if intel:
        score = intel.get('mausam_score', {}).get('score')
        results.append(f'  -> Mausam Score: {score}')
    
    si = test('POST /api/v1/intelligence/should-i (morning run)', lambda: req_post(f'{BASE}/api/v1/intelligence/should-i', {'query': 'Should I go for a morning run today?', 'weather': w_mock, 'context': base_ctx}))
    if si:
        results.append(f'  -> Should-I verdict: {si.get("verdict")}')

# 6. Assistant (chat)
if w_mock:
    chat_payload = {
        'message': 'What is the weather like today?',
        'weather': w_mock,
        'context': base_ctx,
        'conversation_history': [],
        'input_mode': 'text',
        'session_id': 'test-session'
    }
    test('POST /api/v1/assistant/chat', lambda: req_post(f'{BASE}/api/v1/assistant/chat', chat_payload))

# Print all results
print('\n=== API AUDIT RESULTS ===')
for r in results:
    print(r)
