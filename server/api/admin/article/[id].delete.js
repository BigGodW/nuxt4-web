
export default defineEventHandler(async (event) => {
  const articleId = Number(event.context.params.id)
  if (!articleId) return { code: 400, msg: '文章ID错误' }

  await prisma.article.delete({ where: { id: articleId } })
  return { code: 200, msg: '删除成功' }
})