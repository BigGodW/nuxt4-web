export default defineEventHandler(async (event) => {
  const { name, sort = 0 } = await readBody(event)
  if (!name) return { code: 400, msg: '分类名称不能为空' }

  const exist = await prisma.articleCategory.findUnique({ where: { name } })
  if (exist) return { code: 400, msg: '该分类已存在' }

  const data = await prisma.articleCategory.create({ data: { name, sort } })
  return { code: 200, msg: '创建成功', data }
})