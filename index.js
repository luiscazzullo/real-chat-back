//Modules
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const router = require('./router');
const cors = require('cors');
//Helpers
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users/users');

const PORT = process.env.PORT || 5500;

const app = express();
const server = http.createServer(app);
const io = socketio(server);
io.on('connection', socket => {

  socket.on('join', ({ name, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if(error) return cb(error);
    socket.join(user.room);
    socket.emit('message', { user: 'admin', text: `${user.name} ingresó a ${user.room}`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, ingresó`});
    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    cb();
  })
  socket.on('sendMessage', (message, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('message', { user: user.name, text: message });
    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    cb();
  })
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if(user) {
      io.to(user.room).emit('message', { user: 'admin', text: `${user.name} abandonó`})
    }
  })
})

app.use(router);
app.use(cors());

server.listen(PORT, () => console.log(`Servidor corriendo en ${PORT}`))