import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dlWebSocketManager } from '../src/dlWebSocketManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

// Simple demo-auth: always allow, set username from query param or 'guest'
const wsManager = new dlWebSocketManager(server, {
    authenticate: async (req) => {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            return { username: url.searchParams.get('username') || 'guest' };
        } catch {
            return { username: 'guest' };
        }
    }
});

server.listen(3000, () => {
    console.log('Example server running on http://localhost:3000');
});
