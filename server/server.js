const express = require("express")
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");
const path = require("path")

dotenv.config();

connectDB();
const app = express()
app.use(express.json())


app.use("/api/user", userRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/message", messageRoutes)

// ---------------- Deployment --------------------------

const __dirname1 = path.resolve()
console.log(__dirname1);
if (process.env.NODE_ENV === 'production') {
    const parentDir = path.join(__dirname1, '..');
    app.use(express.static(path.join(parentDir, '/client/build')))

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(parentDir,"client","build","index.html"))
    })
} else {
    app.get("/abc", (req, res) => {
        res.json({ msg: "Api is running" });
    })
}
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server started on port ${PORT}`))
// const parentDir = path.join(__dirname1, '..');
const io = require("socket.io")(server, {
    
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
        // origin: `${parentDir}/client/build/index.html`,
    }
})

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room : " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"))
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat

        if (!chat.users) return console.log("chat.users not defined");

        // If a group message is recieved then it should be only recieved by other peoples other than the sender
        chat.users.forEach((user) => {
            if (user._id === newMessageRecieved.sender._id) return;    // if user is the sender

            socket.in(user._id).emit("message recieved", newMessageRecieved)
        })
    })

    socket.off("setup", () => {
        console.log("User Disconnected");
        socket.leave(userData._id)
    })
})


