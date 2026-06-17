<template>
  <div style="width:90%;margin:2rem auto;">
    <h2>文章分类管理</h2>
    <div style="margin:16px 0;display:flex;gap:10px;">
      <input class="input" v-model="newCate.name" placeholder="分类名称" style="padding:6px;"/>
      <input class="input" v-model.number="newCate.sort" placeholder="排序数字" style="width:100px;padding:6px;"/>
      <button class="btn btn-info" @click="addCate">新增分类</button>
    </div>
    <table class="table table-sm" border="1" cellpadding="8" style="width:100%;">
      <thead>
        <tr>
          <th>ID</th>
          <th>分类名称</th>
          <th>排序</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in cateList" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.sort }}</td>
          <td>
            <button class="btn btn-sm btn-success" @click="openEdit(item)">编辑</button>
            <button class="btn btn-sm btn-error" @click="delCate(item.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
definePageMeta({
  layout: 'admin',
})
const cateList = ref([])
const newCate = ref({ name: '', sort: 0 })

async function getList() {
  const res = await useAdminFetch('/api/admin/category/list')
  if (res.code === 200) cateList.value = res.data
}
async function addCate() {
  const res = await useAdminFetch('/api/admin/category/create', {
    method: 'POST',
    body: newCate.value
  })
  if (res.code === 200) {
    newCate.value = { name: '', sort: 0 }
    getList()
  } else alert(res.msg)
}
async function delCate(id) {
  if (!confirm('确认删除？')) return
  await useAdminFetch(`/api/admin/category/${id}`, { method: 'DELETE' })
  getList()
}
getList()
</script>