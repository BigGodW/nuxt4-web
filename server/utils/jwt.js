import jwt from 'jsonwebtoken'

// 读取环境变量密钥和过期时间
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES = process.env.JWT_EXPIRES

/**
 * 签发登录token
 * @param {Object} payload 要存入token的用户信息
 * @returns {String} jwt字符串
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

/**
 * 校验并解析token
 * @param {String} token 前端传来的令牌
 * @returns {Object|null} 解析后的用户信息，失败返回null
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err){
    // 过期、篡改、格式错误全部捕获返回null
    return null
  }
}


/**
 * 从请求头Authorization中提取Bearer token
 * @param {H3Event} event h3请求上下文
 * @returns {String|null} 纯token字符串
 */
export function getAuthToken(event) {
  // 获取请求头 Authorization
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader) return null
  // 分割 "Bearer xxxxx"
  const [type, token] = authHeader.split(' ')
  // 只识别Bearer类型鉴权头
  return type === 'Bearer' ? token : null
}