<template>
  <div style="width:90%;margin:2rem auto;">
    <h2>文章标签管理</h2>
    <div style="margin:16px 0;display:flex;gap:10px;">
      <input class="input" v-model="tagName" placeholder="输入标签名称" style="padding:6px;"/>
      <button class="btn btn-info" @click="addTag">新增标签</button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      <div v-for="tag in tagList" :key="tag.id" style="padding:6px 12px;border:1px solid #ccc;border-radius:6px;">
        {{ tag.name }}
        <button @click="delTag(tag.id)" style="margin-left:8px;color:red;">×</button>
      </div>
    </div>
  </div>
</template>
<script setup>
definePageMeta({
  layout: 'admin',
})
const tagList = ref([])
const tagName = ref('')

async function getList() {
  const res = await useAdminFetch('/api/admin/tag/list')
  if (res.code === 200) tagList.value = res.data
}
async function addTag() {
  if (!tagName.value.trim()) return alert('请输入标签名')
  const res = await useAdminFetch('/api/admin/tag/create', {
    method: 'POST',
    body: { name: tagName.value }
  })
  if (res.code === 200) {
    tagName.value = ''
    getList()
  } else alert(res.msg)
}
async function delTag(id) {
  if (!confirm('删除标签？')) return
  await useAdminFetch(`/api/admin/tag/${id}`, { method: 'DELETE' })
  getList()
}
getList()
</script>