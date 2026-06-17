<template>
  <div class="p-5">
    <input type="file" @change="handleSelect" class="file-input" />
    
    <p v-if="isupload">
      {{ isImage ? '压缩中' : '上传中' }}：{{ progress }}%
      <progress class="progress progress-info w-56" :value="progress" max="100"></progress>
    </p>

    <div v-if="result" class="mt-4">
      <p>文件大小：{{ originSize }} KB</p>
      <p v-if="isImage">压缩后：{{ compressedSize }} KB</p>
      <p v-if="isImage && originSize > 0">压缩率：{{ ((1 - compressedSize/originSize) * 100).toFixed(1) }}%</p>
      <a :href="result.url" target="_blank" class="mt-2 inline-block">
        下载/预览
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as qiniu from 'qiniu-js'
import Compressor from 'compressorjs'

const progress = ref(0)
const isupload = ref(false)
const isImage = ref(false)
const originSize = ref(0)
const compressedSize = ref(0)
const result = ref(null)

// 图片格式列表
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp']

const handleSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  isupload.value = true
  originSize.value = (file.size / 1024).toFixed(2)
  isImage.value = IMAGE_TYPES.includes(file.type)

  if (isImage.value) {
    // ========== 图片文件：转 WebP 压缩 ==========
    new Compressor(file, {
      mimeType: 'image/webp',
      quality: 0.75,
      maxWidth: 1920,
      maxHeight: 1920,
      convertSize: 0,
      
      success(compressedBlob) {
        const webpName = file.name.replace(/\.(png|jpg|jpeg|gif|bmp)$/i, '.webp')
        const compressedFile = new File([compressedBlob], webpName, { type: 'image/webp' })
        
        compressedSize.value = (compressedFile.size / 1024).toFixed(2)
        uploadToQiniu(compressedFile)
      }
    })
  } else {
    // ========== 其他文件：直接上传不压缩 ==========
    compressedSize.value = originSize.value
    uploadToQiniu(file)
  }
}

// 通用上传
async function uploadToQiniu(file) {
  progress.value = 0
  result.value = null

  const { token } = await $fetch('/api/qiniu/token')
  const ext = file.name.split('.').pop()
  const key = `uploads/${crypto.randomUUID()}.${ext}`

  qiniu.upload(file, key, token, null, { useCdnDomain: true })
    .subscribe({
      next: (info) => progress.value = info.total.percent.toFixed(0),
      error: (err) => alert(`上传失败：${err.message}`),
      complete: (res) => saveRecord(res.key, file)
    })
}

async function saveRecord(key, file) {
  const res = await $fetch('/api/upload/save-record', {
    method: 'POST',
    body: {
      key,
      fileName: file.name,
      mimeType: file.type,
      size: file.size
    }
  })
  result.value = res.data
}
</script>