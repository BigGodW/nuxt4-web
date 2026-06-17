export default defineNuxtRouteMiddleware((to) => {
  // 读取cookie中存储的登录token
  const token = useCookie('admin_token')
  // 判断当前页面是否属于后台管理页面
  const isAdminPage = to.path.startsWith('/admin')

  // 非后台页面直接放行，无需登录校验
  if (!isAdminPage) return

  // 访问登录页：已登录则自动跳转到后台首页
  if (to.path === '/admin/login') {
    if (token.value) {
      return navigateTo('/admin/dashboard')
    }
    return
  }

  // 其他后台页面：无token清空cookie并跳转登录页
  if (!token.value) {
    token.value = null
    return navigateTo('/admin/login')
  }
})