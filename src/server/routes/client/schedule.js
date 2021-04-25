// 日程管理
const router = require('koa-router')()
const {
  query
} = require('../../utils/query')
const {
  QUERY_TABLE,
  INSERT_TABLE,
  UPDATE_TABLE,
  DELETE_TABLE
} = require('../../utils/sql');

// 获取日程列表
router.get('/schedules/:openid', async(ctx) => {
  const { openid } = ctx.params
  console.log(openid)
  const responseBody = {
    code: 0,
    data: {}
  }
  try {
    const res = await query(QUERY_TABLE('schedule_list', ['open_id', openid]));
    responseBody.code = 200
    responseBody.data = res
    console.log(res)
  } catch (error) {
    responseBody.code = 404
    responseBody.data = {
      msg: '暂无日程安排'
    }
  } finally{
    ctx.response.status = responseBody.code
    ctx.response.body = responseBody
  }
})

// 新增日程
router.post('/schedules', async(ctx) => {
  const responseBody = {
    code: 0,
    data: {}
  }
  try {
    const { 
      openid,
      content,
      time
    } = ctx.request.body
    console.log(ctx.request.body)
    await query(INSERT_TABLE('schedule_list'), {
      open_id: openid,
      content,
      time
    })
    responseBody.data.msg = '新增成功'
    responseBody.code = 200
  } catch (error) {
    console.log(e)
    responseBody.data.msg = '异常错误'
    responseBody.code = 500
  }finally {
    ctx.response.status = responseBody.code
    ctx.response.body = responseBody
  }

})

module.exports = router