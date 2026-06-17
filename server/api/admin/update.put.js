export default defineEventHandler(async (event) => {
  const { id, nickname, password } = await readBody(event)
  const updateData = { nickname }

  // 传入新密码则加密更新
  if (password) updateData.password = hashPassword(password)

  const res = await prisma.admin.update({
    where: { id },
    data: updateData
  })
  return { code: 200, msg: '修改成功', data: res }
})