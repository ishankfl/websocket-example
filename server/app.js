import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // React app URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.get("/", (req, res) => {
  res.send("Socket.IO Server is running.");
});

const users = {}; // Store connected users and their socket IDs

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Save user and their socket ID
  socket.on("register", (username) => {
    if (!users[username]) {
      socket.emit("registration_success", { username });
      users[username] = socket.id;
      console.log(`${username} registered with socket ID: ${socket.id}`);
      console.log(users);
    } else {
      socket.emit("user_exists", { username });
    }
  });

  // Handle private messages
  socket.on("private_message", ({ sender, recipient, message }) => {
    const recipientSocketId = users[recipient];
    console.log(users);
    console.log(users[recipient]); //key, will return the value of the socket id
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("private_message", { sender, message });
    } else {
      socket.emit("user_not_found", { recipient });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        console.log(`${username} disconnected`);
        break;
      }
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
