export default defineEventHandler(async (event) => {
  const token = getAuthToken(event)
  if (!token) {
    return { code: 401, msg: '未登录' }
  }

  const payload = verifyToken(token)
  // 强制校验adminId，防止undefined传入prisma
  if (!payload || !payload.adminId) {
    return { code: 401, msg: 'token失效，请重新登录' }
  }

  // 根据token内管理员ID查询数据库
  const loginAdmin = await prisma.admin.findUnique({
    where: { id: payload.adminId },
    select: {
      id: true,
      username: true,
      nickname: true,
      avatar: true,
      isSuper: true
    }
  })

  // 账号被删除但token未过期的兜底判断
  if (!loginAdmin) {
    return { code: 401, msg: '管理员账号不存在' }
  }

  return { code: 200, data: loginAdmin }
})