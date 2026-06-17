export default defineEventHandler(async () => {
  const FileList = await prisma.uploadFile.findMany({
  });
  return FileList;
});