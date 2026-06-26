export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const keyword = query.keyword as string

  if (!keyword) return []

  // Prisma 模糊匹配，等价 Sequelize Op.like
  const orchids = await prisma.orchid.findMany({
    where: {
      name: { contains: keyword }
    },
    include: {
      inventories: {
        where: { quantity: { gt: 0 } },
        include: { zone: true }
      }
    }
  })

  // 格式化输出
  const list = orchids
    .map(item => {
      const totalQty = item.inventories.reduce((sum, i) => sum + i.quantity, 0)
      const locations = item.inventories.map(i => ({
        zone: i.zone?.code,
        qty: i.quantity
      }))
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        totalQty,
        locations
      }
    })
    .filter(item => item.totalQty > 0)

  return list
})