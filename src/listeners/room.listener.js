import Room from "../models/Room.js";
import logger from "../core/logger.js";
import RoomEvents from "../core/events/room_events.js";
import DefaultEvents from "../core/events/default_events.js";

/**
 * Responsible of the listening of all the room related events
 *
 * These listeners are registered once the app is launched
 * and binded when a new user connects.
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
  socket.on(RoomEvents.HOLDER_ID, (data) => {
    Room.update(data.room, {
      holder: socket.id,
    });
  });

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
  socket.on(RoomEvents.CREATE_ROOM_EVENT, (data, ack) => {
    const room = new Room(data.subject, data.duration, socket.id);
    room.save();

    ack(room);
    logger.write(room, `Début de la session ${room.subject}`);
  });

  /**
   * Joins  a room
   *
   * @param data {
   *    "room": "the id of the room",
   *    "name": "the name of the user trying to join the room"
   * }
   */
  socket.on(RoomEvents.JOIN_ROOM_EVENT, (data, ack) => {
    let room = Room.find(data.room);

    if (room) {
      socket.to(room.holder).emit(RoomEvents.USER_JOINED, data);
      ack(room);

      logger.write(room, `Nouvelle connexion de ${data.name}`);
    } else {
      ack(null);
    }
  });

  /**
   * Transmits device screenshots continuously
   * @param data {
   *    name: "The student name",
        stream: "The converted image (base64 encoded)",
        room: "The room id",
   * }
   */
  socket.on(RoomEvents.STREAM, (data) => {
    let room = Room.find(data.room);

    if (room) {
      socket.to(room.holder).emit(RoomEvents.USER_STREAM, {
        ...data,
        sid: socket.id,
      });
    }
  });

  /**
   * Triggered when the teacher wants to have a screen of a student
   * with realtime update
   *
   * @param data {
   *    student_id: "The student socket id"
   *    teacher_id: "The teacher socket id"
   * }
   */
  socket.on(RoomEvents.START_UNIQUE_USER_STREAM, (data) => {
    data.teacher_id = socket.id;
    socket.to(data?.student_id).emit(RoomEvents.START_UNIQUE_USER_STREAM, data);
  });

  /**
   * Triggered when the user starts sharing
   * his screen through a P2P connection
   * with the teacher
   *
   * @param data {
   *    student_id: "The student socket id"
   *    teacher_id: "The teacher socket id"
   * }
   */
  socket.on(RoomEvents.UNIQUE_USER_STREAM, (data) => {
    socket.to(data?.teacher_id).emit(RoomEvents.UNIQUE_USER_STREAM, data);
  });

  /**
   * Fired by the teacher
   *
   *
   * @param data {
   *    students: "The list of the students's socket"
   *    room: "The room id"
   * }
   */
  socket.on(RoomEvents.TERMINATE_SESSION, (data) => {
    const students = data?.students || [];
    students.forEach((id) => {
      socket.to(id).emit(RoomEvents.LEAVE_NOW);
    });

    const room = Room.find(data.room);
    logger.write(room, `Fin de la session sur ${room.subject}.`);
  });

  socket.on(RoomEvents.USER_LEAVED, (data) => {
    const room = Room.find(data.room);
    logger.write(room, `Déconnexion de ${data.username}`);
  });

  /**
   * Disconnects the user
   */
  socket.on(DefaultEvents.DISCONNECT, (_) => {
    socket.broadcast.emit("user-leaved", {
      sid: socket.id,
    });
  });
};
