export default defineEventHandler((event) => {
  // 规则1：非 /api/admin/ 开头的接口全部直接放行，不校验登录
  if (!event.path.startsWith('/api/admin/')) return

  // 规则2：白名单接口（登录、注册）无需鉴权
  const publicApiList = ['/api/admin/login', '/api/admin/register']
  if (publicApiList.some(path => event.path.startsWith(path))) return

  // 规则3：校验token是否存在
  const token = getAuthToken(event)
  if (!token) {
    // 手动返回标准JSON格式401，不使用sendError抛出HTML错误
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.statusCode = 401
    event.node.res.end(JSON.stringify({ code: 401, msg: '未登录，请重新登录' }))
    return
  }

  // 规则4：解析token并校验是否携带管理员ID
  const payload = verifyToken(token)
  if (!payload || !payload.adminId) {
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.statusCode = 401
    event.node.res.end(JSON.stringify({ code: 401, msg: '登录已过期，请重新登录' }))
    return
  }

  // 校验通过，挂载管理员信息到请求上下文，后续接口可直接读取
  event.context.admin = payload
})