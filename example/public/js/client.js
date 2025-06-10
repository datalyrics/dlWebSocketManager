const output = document.getElementById('output');
const sendBtn = document.getElementById('send');
const msgInput = document.getElementById('msg');

// Username from prompt or fallback to guest
const username = prompt('Username?') || 'guest';
const ws = new WebSocket(`ws://localhost:3000/?username=${encodeURIComponent(username)}`);

// Heartbeat value must match the server (default: 1)
const HEARTBEAT_VALUE = 1;
let heartbeatInterval;

ws.onopen = () => {
    output.textContent += 'Connected!\n';
    // Start heartbeat
    heartbeatInterval = setInterval(() => {
        ws.send(new Uint8Array([HEARTBEAT_VALUE]));
    }, 4000); // slightly less than server interval
};

ws.onmessage = (event) => {
    if (event.data instanceof Blob) {
        // Try to read the first byte to check for heartbeat
        const reader = new FileReader();
        reader.onload = function() {
            const arr = new Uint8Array(reader.result);
            if (arr.length === 1 && arr[0] === HEARTBEAT_VALUE) {
                // Heartbeat received, ignore
                return;
            }
            // If not a heartbeat, show as hex or info
            output.textContent += '[binary message received]\n';
        };
        reader.readAsArrayBuffer(event.data);
        return;
    }
    output.textContent += event.data + '\n';
};
ws.onclose = () => {
    output.textContent += 'Connection closed\n';
    clearInterval(heartbeatInterval);
};
ws.onerror = (e) => output.textContent += 'Error: ' + e.message + '\n';

sendBtn.onclick = () => {
    ws.send(msgInput.value);
    msgInput.value = '';
};
