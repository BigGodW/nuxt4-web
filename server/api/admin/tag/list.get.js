export default defineEventHandler(async () => {
  const list = await prisma.articleTag.findMany()
  return { code: 200, data: list }
})