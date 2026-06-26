export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  if (!code) {
    setResponseStatus(event, 400)
    return { error: '区块编码不能为空' }
  }

  const inventoryList = await prisma.inventory.findMany({
    where: { zoneCode: code },
    include: {
      orchid: {
        select: { id: true, name: true, type: true }
      }
    }
  })

  return inventoryList
})