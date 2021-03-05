const fs = require('fs')
const path = require('path')
const router = require('koa-router')()
const {
  query
} = require('../../utils/query')


router.post('/upload', async (ctx) => {
  /* 接收formData数据 */
  const {
    openid,
    exerciseId,
    exerciseIndex
  } = ctx.request.body

  // console.log(openid)
  const classInfo = await query(`SELECT class_id, student_id FROM student_class WHERE student_id IN (SELECT student_id FROM student_list WHERE open_id = '${openid}')`)
  const {
    class_id: classId,
    student_id: studentId
  } = classInfo[0]

   // 上传单个文件
   const file = ctx.request.files.files; // 获取上传文件
   // 创建可读流
   const reader = fs.createReadStream(file.path);
   let filePath = path.join(__dirname, '../../../../public/upload') + `/${file.name}`;
   console.log(filePath)
   // 创建可写流
   const upStream = fs.createWriteStream(filePath);
   // 可读流通过管道写入可写流
   reader.pipe(upStream);
   // 插入数据库
   await query(`INSERT INTO upload_exercise(class_id, exercise_id, student_id, exercise_index, file_name) VALUE('${classId}','${exerciseId}','${studentId}','${exerciseIndex}','${file.name}') ON DUPLICATE KEY UPDATE class_id='${classId}', exercise_id='${exerciseId}', student_id='${studentId}', exercise_index='${exerciseIndex}'`)
   
   return ctx.body = {
    filePath,
    msg: "上传成功"
   };
})

module.exports = router
