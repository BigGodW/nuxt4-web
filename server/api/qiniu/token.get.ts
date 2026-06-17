import { getUploadToken } from '../../utils/qiniu'
export default defineEventHandler(() => {
  const uploadToken = getUploadToken()
  return {
    code: 200,
    token: uploadToken
  }
})