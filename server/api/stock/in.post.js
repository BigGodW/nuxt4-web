export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { zoneCode, orchidName, orchidType, quantity } = body

  // 1. 参数校验
  if (!zoneCode || !orchidName || !orchidType || !quantity || quantity <= 0) {
    throw createError({
      statusCode: 400,
      message: '参数不完整或数量无效（兰花类型不能为空）'
    })
  }

  // 2. 开启事务，保证数据一致性
  const result = await prisma.$transaction(async (tx) => {
    
    // 3. 检查区域容量
    const zone = await tx.zone.findUnique({
      where: { code: zoneCode }
    })

    if (!zone) {
      throw createError({ statusCode: 404, message: `区块 ${zoneCode} 不存在` })
    }

    if ((zone.currentCount || 0) + quantity > zone.capacity) {
      throw createError({ 
        statusCode: 400, 
        message: `区块 ${zoneCode} 剩余容量仅 ${zone.capacity - (zone.currentCount || 0)} 盆` 
      })
    }

    // 4. 确保兰花存在（无中生有，有则复用）
    // 注意：复合键使用驼峰字段名拼接：name_type
    const orchid = await tx.orchid.upsert({
      where: {
        name_type: { 
          name: orchidName, 
          type: orchidType 
        },
      },
      update: {}, 
      create: {
        name: orchidName,
        type: orchidType,
      },
    })

    // 5. 处理库存记录（存在则累加，不存在则新建）
    // ⚠️ 核心修改：复合键更新为驼峰命名拼接：zoneCode_orchidId
    const inventory = await tx.inventory.upsert({
      where: {
        zoneCode_orchidId: {
          zoneCode: zoneCode,
          orchidId: orchid.id,
        },
      },
      update: {
        // 核心：原子操作，直接在数据库层面做加法
        quantity: { increment: quantity }, 
      },
      create: {
        zoneCode,
        orchidId: orchid.id,
        quantity,
      },
    })

    // 6. 更新区域当前数量（原子操作）
    await tx.zone.update({
      where: { code: zoneCode },
      data: {
        currentCount: { increment: quantity }
      }
    })

    return inventory
  })

  return {
    success: true,
    message: `成功入库 ${quantity} 盆`,
    data: result
  }
})