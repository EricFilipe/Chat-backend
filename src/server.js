const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const cors = require("cors");
const io = socket(server);

let users = [];

const messages = {
    general: [],
    random: [],
    jokes: [],
    javascript: []
}

app.get('/', (req, res) => {
    res.write(`Socket IO start on port: ${prot}`)
})

io.on("connection", socket => {
    socket.on("join-server", (username) => {
        const user = {
            username,
            id: socket.id,
        };
        users.push(user);
        io.emit("new-user", users);
        console.log(`user ${socket.id} entrou no chat`)
    });

    socket.on("join-room", (roomName, cb) => {
        socket.join(roomName);
        cb(messages[roomName]);
        console.log(`user ${socket.id} entrou no chat ${roomName}`)
    });

    socket.on("send-message", ({ content, to, sender, chatName, isChannel, time}) => {
        if(isChannel) {
            const payload = {
                content,
                chatName,
                sender,
                time
            };
            socket.to(to).emit("new-message", payload);
        } else {
            const payload = {
                content,
                chatName: sender,
                sender,
                time
            };
            socket.to(to).emit("new-message", payload);
        }
        if(messages[chatName]) {
            messages[chatName].push({
                sender,
                content
            });
        };
    });

    socket.on("disconnect", () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit("new-user", users);
    });
});

const port = process.env.PORT || 4000; 

server.listen(port, () => console.log(`server rodando na porta ${port}`));
