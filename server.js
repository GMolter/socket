const WebSocket = require("ws");
const express = require("express");

const PORT = process.env.PORT || 10000;
const app = express();
const server = app.listen(PORT, () => console.log(`Server on ${PORT}`));
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    // Broadcast to all
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });
});
