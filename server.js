/********************************************************************
 * server.js
 * A simple WebSocket server using Node.js, Express, and the 'ws' library.
 * 
 * HOW IT WORKS:
 * 1. The server stores a "scoreboard" object in memory.
 * 2. When a client connects, the server sends them the current scoreboard.
 * 3. When a client sends an updated scoreboard, the server updates its 
 *    in-memory scoreboard and broadcasts the new scores to all clients.
 ********************************************************************/

const WebSocket = require("ws");
const express = require("express");

const PORT = process.env.PORT || 3000;
const app = express();
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Create a WebSocket server using the same HTTP server
const wss = new WebSocket.Server({ server });

// Keep track of the scoreboard in memory
let scoreboard = {
  gavin: 0,
  carson: 0
};

/**
 * Broadcast the current scoreboard to all connected clients
 */
function broadcastScoreboard() {
  const data = JSON.stringify({
    type: "score",
    scoreboard
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on("connection", (ws) => {
  // 1. Send the current scoreboard to the newly connected client
  ws.send(JSON.stringify({
    type: "score",
    scoreboard
  }));

  // 2. Listen for messages from this client
  ws.on("message", (message) => {
    try {
      // Expecting something like: { type: "score", scoreboard: { gavin, carson } }
      const data = JSON.parse(message);

      // If it's a "score" update, replace our in-memory scoreboard and broadcast
      if (data.type === "score" && data.scoreboard) {
        scoreboard = data.scoreboard;
        broadcastScoreboard();
      }
    } catch (err) {
      console.error("Failed to parse incoming message:", err);
    }
  });

  // Optional: handle client disconnect
  ws.on("close", () => {
    console.log("A client disconnected.");
  });
});

console.log("WebSocket server is up and running...");
