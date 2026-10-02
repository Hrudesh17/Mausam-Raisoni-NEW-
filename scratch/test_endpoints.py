import sys
sys.path.insert(0, './backend')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# 1. Test /health
res_health = client.get('/health')
print('HEALTH STATUS:', res_health.status_code, res_health.json())

# 2. Test Pune
res_pune = client.get('/api/v1/weather?lat=18.5204&lon=73.8567&city=Pune')
print('PUNE STATUS:', res_pune.status_code, res_pune.json().get('location', {}).get('name'), 'Temp:', res_pune.json().get('current', {}).get('temperature'))

# 3. Test Delhi
res_delhi = client.get('/api/v1/weather?lat=28.6139&lon=77.2090&city=Delhi')
print('DELHI STATUS:', res_delhi.status_code, res_delhi.json().get('location', {}).get('name'), 'Temp:', res_delhi.json().get('current', {}).get('temperature'))

# 4. Test Hyderabad
res_hyd = client.get('/api/v1/weather?lat=17.3850&lon=78.4867&city=Hyderabad')
print('HYDERABAD STATUS:', res_hyd.status_code, res_hyd.json().get('location', {}).get('name'), 'Temp:', res_hyd.json().get('current', {}).get('temperature'))

# 5. Test Sahayak Query for Hyderabad
res_chat = client.post('/api/v1/assistant/chat', json={
    'message': 'what is the temperature in Hyderabad?',
    'weather': res_hyd.json(),
    'context': {'name': 'Ameya', 'interests': ['commute']},
    'dashboard_location': 'Hyderabad',
    'conversation_location': 'Hyderabad'
})
print('SAHAYAK HYDERABAD STATUS:', res_chat.status_code, 'Reply preview:', res_chat.json().get('reply', '')[:120])
