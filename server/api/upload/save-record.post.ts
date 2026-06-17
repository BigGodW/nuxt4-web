export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { key, fileName, mimeType, size } = body

  if (!key || !fileName) {
    return createError({ statusCode: 400, message: '参数缺失' })
  }

  try {
    // 安全校验：校验七牛该key真实存在，防止伪造key入库
    await statQiniuFile(key)
    const fileUrl = getFileUrl(key)

    // 数据库写入
    const fileRecord = await prisma.uploadFile.create({
      data: {
        fileName,
        key,
        url: fileUrl,
        mimeType,
        size
      }
    })

    return {
      code: 200,
      msg: '入库成功',
      data: fileRecord
    }
  } catch (err) {
    console.error('入库失败', err)
    return createError({ statusCode: 500, message: '文件校验或数据库保存失败' })
  }
})