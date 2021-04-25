const course = require('./course')
const exercise = require('./exercise')
const contact = require('./contact')
const chatroom = require('./chatroom')
const forum = require('./forum')
const websocket = require('./socket')
const login = require('./login')
const classes = require('./class')
const schedule = require('./schedule')
// const upload = require('./upload')
const upload = require('./upload-img')

module.exports = {
  course,
  exercise,
  contact,
  chatroom,
  forum,
  websocket,
  login,
  classes,
  schedule,
  upload
}