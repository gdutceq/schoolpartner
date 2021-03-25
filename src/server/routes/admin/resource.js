const router = require('koa-router')()
const fs = require('fs')
const path = require('path')
const { query } = require('../../utils/query')
const { QUERY_TABLE, INSERT_TABLE, UPDATE_TABLE_MULTI } = require('../../utils/sql');
const { getJWTPayload } = require('../../utils/token')
const parse = require('../../utils/parse')

// 获取所以资料
router.get('/resource', async (ctx) => {
  const responseData = []
  const responseBody = {
    code: 0,
    data: {}
  }
  try {
    // const { authorization } = ctx.header
    // const { classId } = getJWTPayload(authorization)
    const res = await query(QUERY_TABLE('resource_filelists'));
    res.map((item, index) => {
      const { id, course_id, course_name, resource_name, resource_type, resource_size, publish_date, resource_author } = item
      responseData[index] = {
        id,
        courseName: course_name,
        courseId: course_id,
        resourceName: resource_name,
        resourceType: resource_type,
        resourceSize: resource_size,
        publishDate: publish_date,
        resourceAuthor: resource_author
      }
    })
    responseBody.code = 200
    responseBody.data = {
      resourceList: parse(responseData),
      total: responseData.length
    }
  } catch (e) {
    responseBody.code = 404
    responseBody.data = {
      msg: '无课程信息'
    }
  } finally {
    ctx.response.status = responseBody.code
    ctx.response.body = responseBody
  }
})

router.get('/resource/:id', async (ctx) => {
  const { id: courseId } = ctx.params
  const responseBody = {
    code: 0,
    data: {}
  }
  try {
    const res = await query(`SELECT * FROM course_list WHERE id = ${courseId}`);
    const { id, course_name, is_recommend, is_public, course_author, publish_date, course_description, course_rate, course_steps } = res[0]
    responseBody.data = {
      id,
      courseName: course_name,
      isRecommend: !!is_recommend,
      isPublic: !!is_public,
      publishDate: parseInt(publish_date) || 0,
      courseAuthor: course_author,
      courseDescription: course_description,
      courseRate: course_rate,
      courseSteps: course_steps ? JSON.parse(course_steps) : []
    }
    responseBody.code = 200
  } catch (e) {
    responseBody.code = 404
    responseBody.data = {
      msg: '无课程信息'
    }
  } finally {
    ctx.response.status = responseBody.code
    ctx.response.body = responseBody
  }
})

// 删除单个资料
router.delete('/resource/:id', async (ctx) => {
  const id = ctx.params.id
  const responseBody = {
    code: 0,
    data: {}
  }
  try {
    await query(`DELETE FROM resource_filelists WHERE id = ${id}`)
    responseBody.data.msg = '删除成功'
    responseBody.code = 200
  } catch (e) {
    responseBody.data.msg = '无此文件'
    responseBody.code = 404
  } finally {
    ctx.response.status = responseBody.code
    ctx.response.body = responseBody
  }
})

// 批量删除
router.delete('/resource', async (ctx) => {
  const deleteIdList = ctx.request.body
  console.log(ctx.request.body)
  const responseBody = {
    code: 0,
    data: {}
  }
  try {
    await Promise.all(deleteIdList.map(async (deleteId) => {
      // console.log(deleteId)
      await query(`DELETE FROM resource_filelists WHERE id = ${deleteId}`)
    }))
    responseBody.data.msg = '删除成功'
    responseBody.code = 200
  } catch (e) {
    responseBody.data.msg = '无此课程'
    responseBody.code = 404
  } finally {
    ctx.response.status = responseBody.code
    ctx.response.body = responseBody
  }
})

// 上传资料
router.post('/resource/upload', async (ctx) => {
  /* 接收formData数据 */
  const {
    course_id, // 获取的course_id是string类型
    course_name,
    publish_date,
    resource_author
  } = ctx.request.body

   // 上传单个文件
   const file = ctx.request.files.file; // 获取上传文件
  //  console.log(file)
   // 创建可读流
   const reader = fs.createReadStream(file.path);
   let filePath = path.join(__dirname, '../../../../public/resource-upload') + `/${file.name}`;
   // 创建可写流
   const upStream = fs.createWriteStream(filePath);
   // 可读流通过管道写入可写流
   reader.pipe(upStream);
   // 插入数据库(这里插入不能省略数据库表的列名)
   await query(`INSERT INTO resource_filelists(course_id, resource_name, resource_type, resource_size, publish_date, resource_author, course_name)
    VALUES('${Number(course_id)}','${file.name}','${file.name}','${(file.size).toString()}','${publish_date.toString()}','${resource_author}','${course_name}')
    ON DUPLICATE KEY UPDATE course_id='${course_id}', publish_date='${publish_date.toString()}', resource_author='${resource_author}'
   `)

   return ctx.body = {
    data: {
      msg: "上传成功"
    }
   };
})
module.exports = router