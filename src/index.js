import express from 'express'
import httpsLocalhostHost from 'https-localhost'
import https from 'https'
import SocketIO from 'socket.io'
import { ExpressPeerServer } from 'peer'

const app = httpsLocalhostHost()

import cors from 'cors'
/**
 * Socket listeners
 */
import roomEvents from './listeners/room.listener.js'

app.getCerts().then(certs => {

  app.use(cors());

  const server = https.createServer(certs, app)
  const io = SocketIO(server, { origins: '*:*' })



  app.get('/', (req, res) => {
    res.send({
      name: 'Supervisor',
      version: 0.1
    })
  })

  io.on('connection', socket => {
    roomEvents(socket)
  })

  server.listen(3000, () => {
    console.log("Server started on port 3000")
  })
})