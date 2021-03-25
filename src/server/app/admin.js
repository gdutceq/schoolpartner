const Koa = require('koa')
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors');
const body = require('koa-body')
const routes = require('../routes/routes')

const router = new Router()
const admin = new Koa();

const {
  verifyToken,
  interceptToken
} = require('../middleware')
const {
  login,
  info,
  register,
  exercises,
  courses,
  resource,
  exams,
  classes,
  tags,
  dashboard,
  mark
} = require('../routes/admin')

// 文件上传
admin.use(body({
  multipart: true,
  // strict 参数:如果启用，则不解析GET，HEAD，DELETE请求，默认为true
  strict:false,//设为false
  formidable: {
    multipart: true
  }
}))

admin.use(cors())
admin.use(bodyParser())
/* 拦截token */
admin.use(interceptToken())
admin.use(verifyToken())
/* 管理端 */
admin.use(routes(router, {
  login,
  info,
  register,
  exercises,
  courses,
  resource,
  exams,
  classes,
  tags,
  dashboard,
  mark
}))

module.exports = admin