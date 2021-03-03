const router = require('koa-router')()
const { query } = require('../../utils/query')
const { QUERY_TABLE, INSERT_TABLE, UPDATE_TABLE, DELETE_TABLE } = require('../../utils/sql');
const parse = require('../../utils/parse')
const formatTime = require('../../utils/formatTime')

router.get('/contacts', async (ctx) => {
  const response = []
  // 聊天室列表
  const res = await query(QUERY_TABLE('contacts_list'));
  // console.log(res)
  await Promise.all(res.map(async (item, index) => {
    const { title, avatar, contacts_id } = item
    // 某个聊天室聊天记录
    const chatlog = await query(`SELECT * FROM chatlog WHERE room_name = '${contacts_id}' ORDER BY current_time DESC`);
    if(chatlog.length) {
      const latestMessage = chatlog[chatlog.length - 1]
      const { user_name, message, current_time } = latestMessage
      response[index] = {
        title,
        avatar,
        contactsId: contacts_id,
        latestMessage: {
          userName: user_name,
          message,
          currentTime: formatTime(current_time)
        }
      }
    }else{
      // 当前群聊还没有人发言的情况
      // console.log(item)
      response[index] = {
        title,
        avatar,
        contactsId: contacts_id,
        latestMessage: {
          userName: '',
          message: '',
          currentTime: ''
        }
      }
    }
  }))
  ctx.response.body = parse(response)
})

module.exports = router