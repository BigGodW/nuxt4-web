import * as qiniu from 'qiniu-js'
import Compressor from 'compressorjs'

// 允许的图片类型
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp']

/**
 * 七牛云上传通用方法
 * @param {File} file 本地文件对象
 * @param {string} filepath 存储路径前缀，如 article_img
 * @returns {Promise<string|null>} 上传成功返回完整CDN地址，失败返回null
 */
export async function useQiniuUpload(file, filepath) {
  // 仅客户端执行，SSR直接返回null
  if (!process.client) return null

  return new Promise((resolve) => {
    const isImage = IMAGE_TYPES.includes(file.type)

    // 图片：压缩为webp再上传
    if (isImage) {
      new Compressor(file, {
        mimeType: 'image/webp',
        quality: 0.75,
        maxWidth: 1920,
        maxHeight: 1920,
        convertSize: 0,
        error(err) {
          alert(`图片压缩失败：${err.message}`)
          resolve(null)
        },
        success(compressedBlob) {
          // 重命名后缀为webp
          const webpName = file.name.replace(/\.(png|jpg|jpeg|gif|bmp)$/i, '.webp')
          const compressedFile = new File([compressedBlob], webpName, { type: 'image/webp' })
          // 执行上传，完成后resolve线上地址
          uploadToQiniu(compressedFile, filepath, resolve)
        }
      })
    } else {
      // 非图片直接上传
      uploadToQiniu(file, filepath, resolve)
    }
  })
}

/**
 * 真正上传到七牛，上传完成后调用resolve返回url
 * @param {File} file
 * @param {string} filepath
 * @param {Function} resolve Promise回调
 */
async function uploadToQiniu(file, filepath, resolve) {
  try {
    // 走管理员鉴权接口获取token
    const {token} = await useAdminFetch('/api/qiniu/token')
    

    // 生成唯一文件key
    const ext = file.name.split('.').pop()
    const key = `${filepath}/${crypto.randomUUID()}.${ext}`

    // 七牛上传订阅
    const observable = qiniu.upload(file, key, token, null, { useCdnDomain: true })
    observable.subscribe({
      next: () => {},
      error: (err) => {
        alert(`上传失败：${err.message}`)
        resolve(null)
      },
      complete: async () => {
        // 上传完成，调用接口保存上传记录
        const {data:resdata} = await saveRecord(key, file)
        // 拼接完整CDN访问地址返回
        // console.log(recordRes)
        const fullUrl = resdata.url
        resolve(fullUrl)
      }
    })
  } catch (err){
    console.error('上传前置逻辑异常', err)
    alert('上传流程异常')
    resolve(null)
  }
}

/**
 * 保存文件上传记录到数据库
 * @param {string} key 七牛文件key
 * @param {File} file 原文件
 * @returns {Object}
 */
async function saveRecord(key, file) {
  const res = await useAdminFetch('/api/upload/save-record', {
    method: 'POST',
    body: {
      key,
      fileName: file.name,
      mimeType: file.type,
      size: file.size
    }
  })
  return res
}