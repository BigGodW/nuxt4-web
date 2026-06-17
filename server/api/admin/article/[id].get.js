export default defineEventHandler(async (event) => {
  const articleId = Number(event.context.params.id)
  if (!articleId) return { code: 400, msg: '文章ID错误' }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      admin: { select: { nickname: true } },
      category: true,
      tags: true
    }
  })

  if (!article) return { code: 404, msg: '文章不存在' }
  return { code: 200, data: article }
})