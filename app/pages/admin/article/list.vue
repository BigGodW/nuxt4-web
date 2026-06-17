<template>
  <div class="article-list">
    <div class="top-bar flex justify-between m-2 p-2">
      <h2>文章管理</h2>
      <button class="btn btn-info btn-sm" @click="$router.push('/admin/article/add')">新增文章</button>
    </div>

    <table class="table table-xs" border="1" cellpadding="8">
      <thead>
        <tr>
          <th>ID</th>
          <th>标题</th>
          <th>发布人</th>
          <th>状态</th>
          <th>分类</th>
          <th>标签</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in articleList" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.admin.nickname || item.admin.username }}</td>
          <td>{{ item.category?.name || '无分类' }}</td>
<td>
  <span v-for="t in item.tags" :key="t.id" style="margin:0 4px;padding:2px 6px;background:#eee;border-radius:4px;">
    {{ t.name }}
  </span>
  <span v-if="item.tags.length === 0">无标签</span>
</td>
          <td>
            {{ item.status === 1 ? '正常' : item.status === 0 ? '草稿' : '下架' }}
          </td>
          <td>{{ useFormatDate(item.createdAt) }}</td>
          <td class="">
            <button class="btn btn-success btn-sm m-1" @click="$router.push(`/admin/article/edit/${item.id}`)">编辑</button>
            <button class="btn btn-error btn-sm m-1" @click="handleDel(item.id)">删除</button>
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
const router = useRouter()
const articleList = ref([])
const pageInfo = ref({ page: 1, pageSize: 10, total: 0 })

// 获取文章列表
async function getList() {
  const res = await useAdminFetch(`/api/admin/article/list?page=${pageInfo.value.page}&pageSize=${pageInfo.value.pageSize}`)
  if (!res || res.code !== 200) return
  articleList.value = res.data.list
  pageInfo.value = {
    page: res.data.page,
    pageSize: res.data.pageSize,
    total: res.data.total
  }
}

// 删除文章
async function handleDel(id) {
  if (!confirm('确认删除该文章？')) return
  const res = await useAdminFetch(`/api/admin/article/${id}`, { method: 'DELETE' })
  if (res?.code === 200) {
    alert('删除成功')
    getList()
  }
}

getList()
</script>