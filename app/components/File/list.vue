<template>
    <div>
        <!-- {{ fileList }} -->
        <div class=" flex flex-wrap">
            <div class="bg-base-100  relative" v-for="file in fileList" :key="file.id">
                <button class="absolute top-1 right-1 aspect-square badge  badge-ghost"
                    @click="handleDelete(file.id)"
                >×</button>
                <img :src="file.url + '?imageView2/0/w/200'" alt="Shoes" class="object-none object-center w-56 aspect-square" />
            </div>
        </div>
    </div>
</template>

<script setup>
const { data: fileList } = await useFetch('/api/upload/list')

async function handleDelete(fileId) {
  showConfirmDialog({
    title:'确认删除？',
    message:"删除后无法恢复",
    
  }).then(async()=>{
    try {
    await $fetch(`/api/upload/delete?id=${fileId}`, {
      method: 'DELETE'
    })
    // 前端过滤移除当前项
    fileList.value = fileList.value.filter(item => item.id !== fileId)
    showNotify({ type: 'primary', message: '删除成功' });
  } catch (err) {
    showNotify({ type: 'warning', message: '删除失败' });
    console.error(err)
  }
  }).catch(()=>{
    console.log('取消删除')
  })

  // if (!confirm('确定要删除这张图片？云端文件将同步移除，不可恢复！')) return

  
}

</script>