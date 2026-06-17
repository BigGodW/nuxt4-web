<template>
  <NuxtLayout name="admin">
  <div class="dashboard">
    <div v-if="adminInfo">
      <h3>欢迎，{{ adminInfo.nickname || adminInfo.username }}</h3>
      <p>账号ID：{{ adminInfo.id }}</p>
      <p>超级管理员：{{ adminInfo.isSuper ? '是' : '否' }}</p>
      <button @click="logout">退出登录</button>
    </div>
    <div v-else>加载中...</div>
  </div>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  layout: false,
})

// 管理员信息响应式变量
const adminInfo = ref(null)
const router = useRouter()
const tokenCookie = useCookie('admin_token')

// 页面加载自动获取登录用户信息
async function getLoginAdminInfo() {
  const res = await useAdminFetch('/api/admin/me')
  // res为null代表登录失效，直接终止赋值
  if (!res || res.code !== 200) return
  adminInfo.value = res.data
}
getLoginAdminInfo()

// 退出登录：清空cookie并跳登录页
function logout() {
  tokenCookie.value = null
  router.push('/admin/login')
}
</script>