"""
Stress test for Ogabogabo backend.
Run: python stress_test.py
"""
import asyncio
import websockets
import json
import time
import statistics

ROOM_CODE = 'WAJILO'  
WS_BASE = f'ws://127.0.0.1:8000/ws/game/{ROOM_CODE}/'
NUM_CLIENTS = 10

results = []


async def simulate_player(player_id: int):
    start = time.perf_counter()
    try:
        async with websockets.connect(WS_BASE, open_timeout=10) as ws:
            connect_ms = (time.perf_counter() - start) * 1000
            await ws.send(json.dumps({
                'type': 'join_room',
                'name': f'StressBot_{player_id}'
            }))
            msg_start = time.perf_counter()
            raw = await asyncio.wait_for(ws.recv(), timeout=5)
            latency_ms = (time.perf_counter() - msg_start) * 1000
            response = json.loads(raw)
            results.append({
                'player': player_id,
                'connect_ms': round(connect_ms, 2),
                'latency_ms': round(latency_ms, 2),
                'status': 'ok',
                'event': response.get('type'),
            })
            await asyncio.sleep(8)
    except Exception as e:
        results.append({
            'player': player_id,
            'connect_ms': 0,
            'latency_ms': 0,
            'status': f'error: {type(e).__name__}: {e}',
        })


async def main():
    print('=' * 55)
    print(f'  Stress Test — {NUM_CLIENTS} concurrent clients')
    print(f'  Target: {WS_BASE}')
    print('=' * 55)

    start = time.perf_counter()
    await asyncio.gather(*[simulate_player(i) for i in range(NUM_CLIENTS)])
    total_s = time.perf_counter() - start

    ok = [r for r in results if r['status'] == 'ok']
    failed = [r for r in results if r['status'] != 'ok']

    print(f'\n  Successful       : {len(ok)} / {NUM_CLIENTS}')
    print(f'  Failed           : {len(failed)}')
    print(f'  Total time       : {round(total_s, 3)}s')

    if ok:
        conn = [r['connect_ms'] for r in ok]
        lat  = [r['latency_ms'] for r in ok]
        print(f'\n  Connect time (ms): avg {round(statistics.mean(conn),2)} | min {round(min(conn),2)} | max {round(max(conn),2)}')
        print(f'  Latency (ms):      avg {round(statistics.mean(lat),2)} | min {round(min(lat),2)} | max {round(max(lat),2)}')
        print(f'  Throughput:        {round(len(ok)/total_s, 1)} connections/sec')

    if failed:
        print(f'\n  Failures:')
        for r in failed:
            print(f'    Bot_{r["player"]}: {r["status"]}')
    print('=' * 55)


if __name__ == '__main__':
    asyncio.run(main())