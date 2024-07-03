const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const req = require('express/lib/request');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  users
} = require('./utils/users');

const user_pair = [
  ['1', '2'],
  ['3', '4'],
]

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));


app.get('/api/users', (req, res) => {
  res.json(users)
})
io.on('connection', (socket) => {
  console.log('New Scoket connection established');

  socket.on('join', (options, callback) => {
    if (!user_pair.flat().includes(options.userName)) {
      return callback('not in user list');
    }
    const { error, user } = addUser({
      id: socket.id,
      userName: options.userName,
      room: getRoomByUserPair(options.userName)
    });

    if (error) {
      return callback(error);
    }

    console.log(user.room)

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome'));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('Admin', `${user.userName} has joined...!`),
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Bad words not allowed');
    }

    io.to(user.room).emit('message', generateMessage(user.userName, message));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.userName} has left!`),
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

/**
 * 
 * @param {string} user 
 */
function getRoomByUserPair(user) {
  return user_pair.findIndex(x => x.find(y => y === user)).toString()
}