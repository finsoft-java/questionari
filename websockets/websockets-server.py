#!/usr/bin/env python3

# Questo è un websocket semplicissimo, non fa nient'altro che diramare messaggi in brodcast.
# NON si collega al database.
#
# in Linux questo file è eseguibile
# in Windows lanciarlo con py server.py
#
# fermarlo con Ctrl+C oppure kill
#
# a regime, questo server deve essere in esecuzione automatica con la macchina
#
# Dipendenze: python3-websockets
#
# Known bug: quando chiudo Edge va tutto in crash (questo non succede con FF e Chrome)

WEBSOCKET_SERVER = "localhost"
WEBSOCKET_PORT = 9000

import asyncio          # questo modulo dovrebbe già esserci su ubuntu server
import websockets       # per questo serve installare il package python3-websockets

#enable debug info
import logging
logger = logging.getLogger('websockets')
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

clients = set()

async def broadcast_message(websocket_sender, message):
    recipients = [client for client in clients if client is not websocket_sender]
    if recipients:  # asyncio.wait doesn't accept an empty list
        try:
            print("Broadcasting: ", message, " to ", len(recipients), " recipients")

            #DEBUG
            await asyncio.wait([client.send(message) for client in recipients])
            #for client in recipients:
            #    print("Sending to: ", client.remote_address)
            #    await asyncio.wait([client.send(message)])
            #    print("Sent.")
        except KeyboardInterrupt:
            raise
        except:
            # Qui credo ci sia un problema, quando i client interrompono la comunicazione senza dire niente,
            # rimangono nell'array clients
            #import sys
            import sys
            print("We got an exception: ", sys.exc_info()[0])
            raise

async def handler(websocket, path):
    print("Joining: ", websocket.remote_address)
    clients.add(websocket)
    try:
        async for message in websocket:
            await broadcast_message(websocket, message)
    finally:
        print("Removing: ", websocket.remote_address)
        clients.remove(websocket)

start_server = websockets.serve(handler, WEBSOCKET_SERVER, WEBSOCKET_PORT)

asyncio.get_event_loop().run_until_complete(start_server)

print("Websocket server started.")
asyncio.get_event_loop().run_forever()

# FIXME se questo server viene buttato giù, occorrerebbe avvisare tutti i client