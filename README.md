# dlWebSocketManager

A modular WebSocket server for Node.js projects (ESM, modern, reusable).

## Features
- **ESM** module (import/export)
- Heartbeat/Ping-Pong
- Authentication callback (e.g. for JWT, query, ...)
- Broadcast to all clients
- Example integration with Express
- Hello-World frontend for a quick start

## Quickstart

1. **Install dependencies**
   ```sh
   npm install express ws
   ```

2. **Start the example**
   ```sh
   node example/server.js
   ```

3. **Open in browser**
   [http://localhost:3000](http://localhost:3000)

4. **Test**
   - Enter username (popup)
   - Send and receive messages

## Integration in your own projects

```js
import { dlWebSocketManager } from './src/dlWebSocketManager.js';

const wsManager = new dlWebSocketManager(server, {
    heartbeatInterval: 1000 * 5,
    heartbeatValue: 1,
    authenticate: async (req) => {
        // ... your own authentication ...
        return { username: 'foo' };
    }
});
```

## API
- **constructor(server, options)**
  - `heartbeatInterval` (ms)
  - `heartbeatValue` (number)
  - `authenticate: async (req) => userData | null`

## Example client
See `example/public/js/client.js` and `example/public/index.html`.

---

**Questions or feature requests? Just ask!**
