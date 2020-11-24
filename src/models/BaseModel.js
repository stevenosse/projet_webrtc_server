import { v4 as uuidV4 } from 'uuid'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync.js'

const adapter = new FileSync('db.json')
const db = low(adapter)

export default class BaseModel {
  constructor() {
    db.defaults({ rooms: [] }).write()

    this.db = db

    this._id = uuidV4()
  }
}