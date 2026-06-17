export default defineEventHandler(async (event) => {
  const id = Number(event.context.params.id)
  const { name, sort } = await readBody(event)
  if (!name) return { code: 400, msg: '分类名称不能为空' }

  await prisma.articleCategory.update({
    where: { id },
    data: { name, sort }
  })
  return { code: 200, msg: '修改成功' }
})