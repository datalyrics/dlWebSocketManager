// src/dlWebSocketManager.js (entry point for the dlWebSocketManager class)
import { WebSocketServer } from 'ws';

export class dlWebSocketManager {
    constructor(server, {
        heartbeatInterval = 1000 * 5,
        heartbeatValue = 1,
        authenticate = null // async (req) => userData | null
    } = {}) {
        this.wss = new WebSocketServer({ noServer: true });
        this.heartbeatInterval = heartbeatInterval;
        this.heartbeatValue = heartbeatValue;
        this.authenticate = authenticate;
        this.setupUpgrade(server);
        this.setupEvents();
    }

    setupUpgrade(server) {
        server.on('upgrade', async (req, socket, head) => {
            try {
                let userData = null;
                if (typeof this.authenticate === 'function') {
                    userData = await this.authenticate(req);
                }
                if (!userData) {
                    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                    socket.destroy();
                    return;
                }
                req.user = userData;
                this.wss.handleUpgrade(req, socket, head, (ws) => {
                    this.wss.emit('connection', ws, req);
                });
            } catch (e) {
                socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
                socket.destroy();
            }
        });
    }

    setupEvents() {
        this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));
        this.wss.on('close', () => clearInterval(this.interval));
        this.startHeartbeat();
    }

    handleConnection(ws, req) {
        ws.isAlive = true;
        ws.username = req.user?.username || 'anonymous';
        ws.on('error', (e) => console.error('WebSocket error:', e));
        ws.on('message', (msg, isBinary) => this.handleMessage(ws, msg, isBinary));
        ws.on('close', () => console.log('Connection closed'));
    }

    handleMessage(ws, msg, isBinary) {
        if (isBinary && msg[0] === this.heartbeatValue) {
            ws.isAlive = true;
        } else {
            const messageWithUsername = `${ws.username}: ${msg}`;
            this.wss.clients.forEach((client) => {
                if (client.readyState === 1) {
                    client.send(messageWithUsername, { binary: isBinary });
                }
            });
        }
    }

    startHeartbeat() {
        this.interval = setInterval(() => {
            this.wss.clients.forEach((client) => {
                if (!client.isAlive) {
                    client.terminate();
                    return;
                }
                client.isAlive = false;
                this.ping(client);
            });
        }, this.heartbeatInterval);
    }

    ping(ws) {
        ws.send(Buffer.from([this.heartbeatValue]), { binary: true });
    }
}
