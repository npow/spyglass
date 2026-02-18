import { WebSocketServer, WebSocket } from 'ws';

const PORT = 9876;
const TARGET = 'wss://stream.aisstream.io/v0/stream';

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (client) => {
  console.log('[proxy] Browser connected');
  const upstream = new WebSocket(TARGET);
  const pending = [];      // buffer messages until upstream is open
  let upstreamOpen = false;

  upstream.on('open', () => {
    console.log('[proxy] Upstream connected, flushing', pending.length, 'buffered messages');
    upstreamOpen = true;
    for (const msg of pending) upstream.send(msg);
    pending.length = 0;
  });

  // Forward browser → AISStream (buffer if not yet open)
  client.on('message', (data) => {
    const str = data.toString();
    if (upstreamOpen && upstream.readyState === WebSocket.OPEN) {
      upstream.send(str);
    } else {
      pending.push(str);
    }
  });

  // Forward AISStream → browser
  upstream.on('message', (data) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data.toString());
    }
  });

  upstream.on('close', (code, reason) => {
    console.log(`[proxy] Upstream closed: ${code} ${reason}`);
    if (client.readyState === WebSocket.OPEN) client.close();
  });

  upstream.on('error', (err) => {
    console.error('[proxy] Upstream error:', err.message);
    if (client.readyState === WebSocket.OPEN) client.close();
  });

  client.on('close', () => {
    console.log('[proxy] Browser disconnected');
    if (upstream.readyState === WebSocket.OPEN) upstream.close();
  });

  client.on('error', (err) => {
    console.error('[proxy] Client error:', err.message);
    if (upstream.readyState === WebSocket.OPEN) upstream.close();
  });
});

console.log(`[proxy] AISStream WebSocket proxy listening on ws://localhost:${PORT}`);
