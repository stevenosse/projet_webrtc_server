import BaseModel from './BaseModel.js'

const tableName = 'rooms'

/**
 * Room Model
 */
export default class Room extends BaseModel {
  constructor(subject, duration, holder) {
    super()
    this.subject = subject
    this.duration = duration
    this.holder = holder
  }

  save() {
    this.db.get(tableName)
      .push({
        _id: this._id,
        subject: this.subject,
        duration: this.duration,
        holder: this.holder
      })
      .write()
  }

  static find(id) {
    return new this().db.get(tableName)
      .find({ _id: id })
      .value()
  }

  static update(id, data) {
    new this().db.get('rooms')
      .find({ _id: id })
      .assign(data)
      .write()
  }
}