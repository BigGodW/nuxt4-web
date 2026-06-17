export default defineEventHandler(async (event) => {
  const { id } = getQuery(event)
  await prisma.admin.delete({ where: { id } })
  return { code: 200, msg: '删除成功' }
})