export default defineEventHandler(async () => {
  const zones = await prisma.zone.findMany({
    orderBy: { code: 'asc' }
  })
  return zones
})