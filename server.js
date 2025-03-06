const WebSocket = require("ws");
const express = require("express");

const PORT = process.env.PORT || 10000;
const app = express();
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const wss = new WebSocket.Server({ server });

// Keep track of scores for Gavin and Carson
let scoreboard = { Gavin: 0, Carson: 0 };

// Send updated scores to all connected clients
function broadcastScoreboard() {
  const data = {
    type: "scoreUpdate",
    scoreboard
  };
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
  // Send the current scores to the newly connected client
  ws.send(JSON.stringify({
    type: "scoreUpdate",
    scoreboard
  }));

  // Listen for messages like { action: "increment", player: "Gavin" }
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.action === "increment" && scoreboard.hasOwnProperty(data.player)) {
        scoreboard[data.player]++;
        broadcastScoreboard();
      } else if (data.action === "decrement" && scoreboard.hasOwnProperty(data.player)) {
        scoreboard[data.player]--;
        broadcastScoreboard();
      }
    } catch (e) {
      console.log("Error parsing message:", e);
    }
  });
});
