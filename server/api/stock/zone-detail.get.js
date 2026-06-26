

// 前端枚举文字映射
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
  const zoneCode = query.zoneCode

  if (!zoneCode) {
    throw createError({ statusCode: 400, message: '缺少区块编号 zoneCode' })
  }

  const list = await prisma.inventory.findMany({
    where: { zoneCode },
    include: {
      orchid: true
    }
  })

  // 枚举转中文返回前端
  const result = list.map(item => ({
    id: item.id,
    quantity: item.quantity,
    zoneCode: item.zoneCode,
    Orchid: {
      id: item.orchid.id,
      name: item.orchid.name,
      type: typeMapReverse[item.orchid.type]
    }
  }))

  return result
})