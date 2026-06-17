export default defineEventHandler(async (event) => {
  // 读取POST请求body参数
  const body = await readBody(event)
  const { username, password, nickname } = body

  // 参数校验
  if (!username || !password) {
    return { code: 400, msg: '账号和密码不能为空' }
  }

  // 查询账号是否已存在
  const existAdmin = await prisma.admin.findUnique({
    where: { username }
  })
  if (existAdmin) {
    return { code: 400, msg: '该账号已注册' }
  }

  // 密码加盐加密，10轮加密强度
  const salt = bcrypt.genSaltSync(10)
  const hashPassword = bcrypt.hashSync(password, salt)

  // 创建管理员数据，只返回关键信息，不返回加密密码
  const newAdmin = await prisma.admin.create({
    data: {
      username,
      password: hashPassword,
      nickname
    },
    select: {
      id: true,
      username: true,
      nickname: true,
      isSuper: true
    }
  })

  return { code: 200, msg: '管理员创建成功', data: newAdmin }
})