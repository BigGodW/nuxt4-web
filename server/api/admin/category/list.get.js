export default defineEventHandler(async () => {
  const list = await prisma.articleCategory.findMany({ orderBy: { sort: 'asc' } })
  return { code: 200, data: list }
})