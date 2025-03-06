const WebSocket = require("ws");
const express = require("express");

const PORT = process.env.PORT || 10000;
const app = express();
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const wss = new WebSocket.Server({ server });

// Keep track of each client and their ID
let clients = new Map();

wss.on("connection", (ws) => {
  // Generate a unique ID for this new client
  const id = Math.random().toString(36).substr(2, 9);
  clients.set(ws, id);

  // Listen for messages from this client
  ws.on("message", (message) => {
    // message is something like { x: 123, y: 456 }
    const data = JSON.parse(message);

    // Attach the client’s unique ID
    data.id = id;

    // Broadcast to ALL connected clients (including the sender)
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  // If the client disconnects
  ws.on("close", () => {
    clients.delete(ws);
  });
});

console.log("WebSocket server running...");
