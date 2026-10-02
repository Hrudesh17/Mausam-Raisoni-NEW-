import urllib.request
url = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=18.5204&longitude=73.8567&current=pm10,pm2_5'
req = urllib.request.Request(url, headers={'Origin': 'https://v-ayusync.netlify.app'})
res = urllib.request.urlopen(req)
print('Status:', res.status)
print('Access-Control-Allow-Origin:', res.headers.get('Access-Control-Allow-Origin'))
