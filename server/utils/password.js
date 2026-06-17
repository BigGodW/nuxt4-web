import bcrypt from 'bcryptjs'
const saltRounds = 10

// 加密密码
export function hashPassword(pwd) {
  return bcrypt.hashSync(pwd, saltRounds)
}

// 对比密码
export function comparePassword(raw, hash) {
  return bcrypt.compareSync(raw, hash)
}