export default defineEventHandler(async (event) => {
  const loginAdmin = event.context.admin
  const articleId = Number(event.context.params.id)
  const body = await readBody(event)
  const { title, content, cover, status, categoryId, tagIdList = [] } = body

  if (!articleId || !title || !content) {
    return { code: 400, msg: '参数不全' }
  }

  const updated = await prisma.article.update({
    where: { id: articleId },
    data: {
      title,
      content,
      cover: cover || null,
      status: Number(status),
      categoryId: categoryId ? Number(categoryId) : null,
      // 同步标签：先断开全部，再重新关联选中标签
      tags: {
        set: tagIdList.map(tagId => ({ id: Number(tagId) }))
      }
    },
    include: {
      category: true,
      tags: true
    }
  })

  return { code: 200, msg: '更新成功', data: updated }
})