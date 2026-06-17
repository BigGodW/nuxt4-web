export default defineEventHandler(async (event) => {
  const loginAdmin = event.context.admin
  const body = await readBody(event)
  const { title, content, cover, status, categoryId, tagIdList = [] } = body

  if (!title || !content) {
    return { code: 400, msg: '标题和内容不能为空' }
  }

  const article = await prisma.article.create({
    data: {
      title,
      content,
      cover: cover || null,
      status: status ?? 1,
      adminId: loginAdmin.adminId,
      categoryId: categoryId ? Number(categoryId) : null,
      // 关联标签多对多
      tags: {
        connect: tagIdList.map(tagId => ({ id: Number(tagId) }))
      }
    },
    include: {
      category: true,
      tags: true
    }
  })

  return { code: 200, msg: '文章创建成功', data: article }
})