//@ts-check
require('dotenv').config()
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const req = require('express/lib/request');
const Filter = require('bad-words');
const {
  serverMessage,
  userMessage,
  getHistory,
} = require('./models/messages');
const {
  addUser,
  getAllUser,
  getUsersInRoom,
  getUserByNickName,
} = require('./models/users');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080"
  },
});

const publicDirectoryPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

/**
 * @type {Map<string, import('./utils/firebase').User>}
 */
const current_users = new Map();

app.use(express.static(publicDirectoryPath));


app.get('/api/users', async (req, res) => {
  const users = await getAllUser()
  res.json(users)
})
io.on('connection', (socket) => {
  console.log('New Scoket connection established');

  socket.on('join', async (options, callback) => {
    console.log('options', options)
    let user;
    try {
      user = await getUserByNickName(options?.nickname);
      console.log('user', user)
    } catch (e) {
      return callback(e);
    }

    if (!user) {
      return callback('not in user list');
    }
    if (!user.room) {
      return callback('user has no room');
    }

    current_users.set(socket.id, user);
    socket.join(user.room);

    // socket.emit('message', serverMessage('Admin', 'Welcome'));
    socket.emit('history', await getHistory(user, Date.now()));

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        serverMessage('Admin', `${user.nickname} has joined...!`),
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on('sendMessage', async (message, callback) => {
    const user = current_users.get(socket.id);

    console.log('user', user)

    if (!user) {
      return callback(`user is disconnected`);
    }

    if (!user.room) {
      return callback('user has no room');
    }

    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Bad words not allowed');
    }

    io.to(user.room).emit('message', await userMessage(user, message));
    callback();
  });

  socket.on('disconnect', async () => {

    const user = current_users.get(socket.id);
    current_users.delete(socket.id);

    if (user && user.room) {
      io.to(user.room).emit(
        'message',
        serverMessage('Admin', `${user.nickname} has left!`),
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: await getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});