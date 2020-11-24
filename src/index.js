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

/**
 * Retrieve Certificates
 * 
 * Necessary for the app to be usable over https
 */
app.getCerts().then(certs => {

  app.use(cors());

  /**
   * Creating the http server and socket.io instance
   */
  const server = https.createServer(certs, app)
  const io = SocketIO(server, { origins: '*:*' })

  app.get('/', (req, res) => {
    res.send({
      name: 'Supervisor',
      version: 0.1
    })
  })

  /**
   * Binding events on user connected
   */
  io.on('connection', socket => {
    roomEvents(socket)
  })

  /**
   * Listening to queries on port 3000
   */
  server.listen(3000, () => {
    console.log("Server started on port 3000")
  })
})