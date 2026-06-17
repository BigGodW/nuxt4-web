export default defineEventHandler(async (event) => {
  try {
    // 取URL参数 id
    const { id } = getQuery(event)
    if (!id || typeof id !== 'string') {
      return createError({ statusCode: 400, message: '缺少文件id' })
    }

    // 1. 查询数据库记录
    const fileRecord = await prisma.uploadFile.findUnique({
      where: { id }
    })
    if (!fileRecord) {
      return createError({ statusCode: 404, message: '数据库无此文件记录' })
    }

    // 2. 先删七牛云文件
    await deleteQiniuFile(fileRecord.key)

    // 3. 云端删除成功，再删数据库
    await prisma.uploadFile.delete({
      where: { id }
    })

    return {
      code: 200,
      msg: '文件已云端+数据库同步删除'
    }
  } catch (err) {
    console.error('删除异常：', err)
    return createError({ statusCode: 500, message: '删除失败，请重试' })
  }
})