export default defineEventHandler(async (event) => {
  const { name } = await readBody(event)
  if (!name) return { code: 400, msg: '标签名称不能为空' }

  const exist = await prisma.articleTag.findUnique({ where: { name } })
  if (exist) return { code: 400, msg: '该标签已存在' }

  const data = await prisma.articleTag.create({ data: { name } })
  return { code: 200, msg: '创建成功', data }
})