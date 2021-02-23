const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generatemessage, generatelocationmessage } = require('./utils/messages')
const { adduser, removeuser, getuser, getusersinroom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicdirectorypath = path.join(__dirname, '../public')

app.use(express.static(publicdirectorypath))


io.on('connection', (socket) => {
    console.log('new web socket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = adduser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generatemessage('admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generatemessage('admin', `${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getusersinroom(user.room)
        })
        callback()
    })

    socket.on('sendmessage', (message, callback) => {
        const user = getuser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generatemessage(user.username, message))
        callback()
    })

    socket.on('sendlocation', (coords, callback) => {
        const user = getuser(socket.id)
        io.to(user.room).emit('locationmessage', generatelocationmessage(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeuser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generatemessage('admin', `${user.username} has lefted!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getusersinroom(user.room)
            })
        }
    })


})


server.listen(port, () => {
    console.log(`server is up on port ${port}!`)
})