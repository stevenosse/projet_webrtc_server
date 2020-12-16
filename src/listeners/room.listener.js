import Room from '../models/Room.js'

/**
 * Responsible of the listening of all the room related events
 * 
 * These listeners are registered once the application is started
 * and a new connection is coming in.
 */
export default (socket, io) => {
  /**
   * When the teacher enters a room, we need to add him
   * to the room for him to receive all that room related events.
   * 
   * @param data {
   *    "room": "the room id",
   *    "id":   "the teacher id"
   * }
   */
  socket.on('holder-id', data => {
    let room = new Room()

    room.update(data.room, {
      holder: socket.id,
    })

    socket.join(room._id)

    // TODO: If there are connected students to the room, update the teacher id for them
  })

  /**
   * Creates a room
   * 
   * @param data {
   *    "subject": "the subject of the evaluation",
   *    "duration": "the duration of the evaluation",
   * }
   * 
   * @emits room-created to notify the iniator the room was created.
   */
  socket.on('create-room', data => {
    const room = new Room(data.subject, data.duration, socket.id)
    room.save()

    socket.join(room._id)

    socket.emit('room-created', room)
  })

  /**
   * Joins  a room
   * 
   * @param data {
   *    "room": "the id of the room",
   *    "name": "the name of the user trying to join the room"
   * }
   */
  socket.on('join-room', data => {
    let room = new Room()
    room = room.find(data.room)

    if (room) {
      socket.join(room._id)
      socket.to(room.holder).emit('user-joined', data);

      socket.emit('join-room', room)
    } else {
      socket.emit('room-does-not-exist')
    }
  })

  /**
   * Transmits device screenshots continuously
   */
  socket.on('stream', data => {
    let room = new Room()
    room = room.find(data.room)

    if(room) {
      socket.to(room.holder).emit('user-stream', {
        ...data,
        sid: socket.id
      })
    }
  })

  socket.on('start-unique-user-stream', data => {
    data.teacher_id = socket.id
    socket.to(data?.student_id).emit('start-unique-user-stream', data)
  })

  socket.on('unique-user-stream', data => {
    socket.to(data?.teacher_id).emit('unique-user-stream', data)
  })

  socket.on("terminate-session", data => {
    console.log(data.students)
    const students = data?.students || []
    for(const id of students) {
      socket.to(id).emit("leave-now")
    }
  })

  /**
   * Disconnects the user
   */
  socket.on('disconnect', (_) => {
    socket.broadcast.emit("user-leaved", {
      sid: socket.id
    })
  })
}