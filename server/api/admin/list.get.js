export default defineEventHandler(async () => {
  const list = await prisma.admin.findMany({
    select: { id: true, username: true, nickname: true, createdAt: true }
  })
  return { code: 200, data: list }
})