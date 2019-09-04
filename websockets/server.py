#!/usr/bin/env python3

# Questo è un websocket semplicissimo, non fa nient'altro che diramare messaggi in brodcast
# NON si collega al database.
# in Linux questo file è eseguibile (altrimenti lanciarlo con python 3)
# fermarlo con Ctrl+C oppure kill
# a regime, questo server deve essere in esecuzione automatica con la macchina

WEBSOCKET_SERVER = "localhost"
WEBSOCKET_PORT = 9000

import asyncio          # questo modulo dovrebbe già esserci su ubuntu server
import websockets       # per questo serve installare il package python3-websockets

clients = set()

async def broadcast_message(websocket_sender, message):
    recipients = [client for client in clients if client is not websocket_sender]
    if recipients:  # asyncio.wait doesn't accept an empty list
        await asyncio.wait([client.send(message) for client in recipients])

async def main(websocket, path):
    clients.add(websocket)
    try:
        async for message in websocket:
            await broadcast_message(websocket, message)
    finally:
        clients.remove(websocket)

start_server = websockets.serve(main, WEBSOCKET_SERVER, WEBSOCKET_PORT)

asyncio.get_event_loop().run_until_complete(start_server)

print("Server started.")
asyncio.get_event_loop().run_forever()
