<template>
  <div class="login-container">
    <h2>后台管理员登录</h2>
    <div class="form-item">
      <label>账号</label>
      <input v-model="form.username" placeholder="请输入账号" />
    </div>
    <div class="form-item">
      <label>密码</label>
      <input v-model="form.password" type="password" placeholder="请输入密码" />
    </div>
    <button @click="handleLogin" class="m-2">登录</button>
    <button class="btn btn-error m-2" @click="addAdmin">默认注册</button>
    <p style="color: red;" v-if="errorMsg">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
// 路由实例
const router = useRouter()
// 存储登录token到cookie，有效期7天
const tokenCookie = useCookie('admin_token', { maxAge: 7 * 24 * 3600 })
const addAdmin = async ()=>{
    
}
// 表单响应式数据
const form = ref({
  username: '',
  password: ''
})
// 错误提示文本
const errorMsg = ref('')



// 登录提交函数
async function handleLogin() {
  errorMsg.value = ''
  // 调用登录接口
  const res = await $fetch('/api/admin/login', {
    method: 'POST',
    body: form.value
  })

  // 登录失败展示提示
  if (res.code !== 200) {
    errorMsg.value = res.msg
    return
  }

  // 登录成功，存储token并跳转后台首页
  tokenCookie.value = res.data.token
  router.push('/admin/dashboard')
}
</script>

<style scoped>
.login-container {
  width: 400px;
  margin: 100px auto;
}
.form-item {
  margin: 12px 0;
}
input {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
}
button {
  width: 100%;
  padding: 10px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>