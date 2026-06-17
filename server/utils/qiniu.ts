import "dotenv/config";
import { env} from "prisma/config";
import qiniu from 'qiniu'
const accessKey = env("QINIU_ACCESS_KEY")
const secretKey = env("QINIU_SECRET_KEY")
const bucket = env("QINIU_BUCKET")
const domain = env("QINIU_DOMAIN")


export function getUploadToken(fileKey?: string) {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: bucket + (fileKey ? `:${fileKey}` : ''),
    expires: 3600, // 凭证1小时有效期
    // 可选：限定上传文件类型、大小
    // mimeLimit: 'image/jpeg;image/png'
  })
  return putPolicy.uploadToken(mac)
}

export function getFileUrl(key: string) {
  return `https://${domain}/${encodeURIComponent(key)}`
}

export async function statQiniuFile(key: string) {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  const bucketManager = new qiniu.rs.BucketManager(mac, new qiniu.conf.Config())
  return new Promise((resolve, reject) => {
    bucketManager.stat(bucket, key, (err, respBody, respInfo) => {
      if (err || respInfo.statusCode !== 200) reject(err)
      else resolve(respBody)
    })
  })
}

// 文件删除
export async function deleteQiniuFile(key: string) {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  const bucketManager = new qiniu.rs.BucketManager(mac, new qiniu.conf.Config())

  return new Promise<void>((resolve, reject) => {
    bucketManager.delete(bucket, key, (err, respBody, respInfo) => {
      // 200成功；612=文件不存在，也视为删除成功
      if (err) {
        return reject(err)
      }
      if (respInfo.statusCode === 200 || respInfo.statusCode === 612) {
        resolve()
      } else {
        reject(new Error(`七牛删除失败，状态码：${respInfo.statusCode}`))
      }
    })
  })
}