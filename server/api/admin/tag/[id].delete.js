export default defineEventHandler(async (event) => {
  const id = Number(event.context.params.id)
  await prisma.articleTag.delete({ where: { id } })
  return { code: 200, msg: '删除成功' }
})