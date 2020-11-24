import Room from '../models/Room.js'

export default (socket) => {
  socket.on('holder-id', data => {
    let room = new Room()

    room.update(data.room, {
      holder: socket.id,
    })

    socket.join(room._id)
  })

  socket.on('create-room', data => {
    const room = new Room(data.subject, data.duration, socket.id)
    room.save()

    socket.join(room._id)

    socket.emit('room-created', room)
  })

  socket.on('join-room', data => {
    let room = new Room()
    room = room.find(data.room)

    if (room) {
      socket.join(room._id)
      socket.to(room._id).emit('user-joined', data)
      socket.emit('join-room', room)
    } else {
      socket.emit('room-does-not-exist')
    }
  })

  socket.on('stream', data => {
    socket.broadcast.emit('user-stream', data)
  })

  socket.on('disconnect', data => {
    console.log(data)
  })
}