export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { zoneCode, orchidId, quantity } = body
  // 1. 基础参数校验
  if (!zoneCode || !orchidId || !quantity || quantity <= 0) {
    throw createError({
      statusCode: 400,
      message: '参数不完整或出库数量无效'
    })
  }

  // 2. 开启事务
  const result = await prisma.$transaction(async (tx) => {
    
    // 3. 核心：在数据库层面直接校验库存并扣减（防止并发超卖）
    // 只有当当前 quantity >= 传入的 quantity 时，update 才会生效
    const updateResult = await tx.inventory.updateMany({
      where: {
        zoneCode: zoneCode,
        orchidId: orchidId,
        quantity: { gte: quantity } // 关键：保证库存充足才允许扣减
      },
      data: {
        quantity: { decrement: quantity } // 原子操作：直接扣减
      }
    })

    // 如果 updateMany 影响行数为 0，说明库存不存在或不足
    if (updateResult.count === 0) {
      throw createError({ 
        statusCode: 400, 
        message: '该区块此品种库存不足或不存在' 
      })
    }

    // 4. 如果扣减后库存变为 0，则删除该库存记录（保持表整洁）
    // 注意：这里需要重新查询确认当前数量，因为上面是原子操作
    const remainingInv = await tx.inventory.findUnique({
      where: {
        zoneCode_orchidId: {
          zoneCode: zoneCode,
          orchidId: orchidId
        }
      }
    })

    if (remainingInv && remainingInv.quantity === 0) {
      await tx.inventory.delete({
        where: {
          zoneCode_orchidId: {
            zoneCode: zoneCode,
            orchidId: orchidId
          }
        }
      })
    }

    // 5. 更新区域总容量（原子操作）
    await tx.zone.update({
      where: { code: zoneCode },
      data: {
        currentCount: { decrement: quantity }
      }
    })

    return { success: true }
  })

  return {
    success: true,
    message: `成功出库 ${quantity} 盆`
  }
})