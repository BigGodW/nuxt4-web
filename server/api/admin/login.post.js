import bcrypt from 'bcryptjs'
export default defineEventHandler(async (event) => {
  // 读取前端提交账号密码
  const { username, password } = await readBody(event)

  // 查询数据库匹配账号
  const admin = await prisma.admin.findUnique({
    where: { username }
  })
  if (!admin) {
    return { code: 401, msg: '账号不存在' }
  }

  // 比对明文密码和加密密码
  const passwordMatch = bcrypt.compareSync(password, admin.password)
  if (!passwordMatch) {
    return { code: 401, msg: '密码错误' }
  }

  // 签发token，存入管理员ID、账号、超级管理员标识
  const token = signToken({
    adminId: admin.id,
    username: admin.username,
    isSuper: admin.isSuper
  })

  // 返回token和管理员基础信息
  return {
    code: 200,
    msg: '登录成功',
    data: {
      token,
      adminInfo: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        isSuper: admin.isSuper
      }
    }
  }
})