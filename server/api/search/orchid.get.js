
const typeMapReverse = {
  ChunLan: '春兰',
  ChunJian: '春剑',
  HuiLan: '蕙兰',
  LianBan: '莲瓣兰',
  XiaLan: '夏兰',
  HanLan: '寒兰',
  MoLan: '墨兰',
  Other: '其他'
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const keyword = query.kw || ''

  if (!keyword.trim()) return []

  // 模糊搜索兰花名称
  const orchidList = await prisma.orchid.findMany({
    where: {
      name: { contains: keyword }
    },
    include: {
      inventories: {
        include: { zone: true }
      }
    }
  })

  // 格式化返回前端
  const result = orchidList.map(orchid => {
    const totalQty = orchid.inventories.reduce((sum, item) => sum + item.quantity, 0)
    const locations = orchid.inventories.map(item => ({
      zone: item.zone.code,
      qty: item.quantity
    }))

    return {
      id: orchid.id,
      name: orchid.name,
      type: typeMapReverse[orchid.type],
      totalQty,
      locations
    }
  })

  return result
})