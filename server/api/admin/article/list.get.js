export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const skip = (page - 1) * pageSize

  const where = {}
  if (query.status) where.status = Number(query.status)

  const total = await prisma.article.count({ where })
  const list = await prisma.article.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
    include: {
      admin: { select: { id: true, username: true, nickname: true } },
      category: true,
      tags: true
    }
  })

  return {
    code: 200,
    data: {
      list,
      total,
      page,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }
})