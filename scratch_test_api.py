import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        r = await client.get('https://api.open-meteo.com/v1/forecast?latitude=18.52&longitude=73.85&current=temperature_2m')
        print(r.status_code, r.text)

asyncio.run(test())
