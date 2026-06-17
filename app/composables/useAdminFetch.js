/**
 * 自动携带登录token的后台请求封装
 * @param {String} url 请求地址
 * @param {Object} opts $fetch配置项
 * @returns {Promise<Object|null>} 接口返回数据，登录失效返回null
 */
export async function useAdminFetch(url, opts) {
  const token = useCookie('admin_token')
  const router = useRouter()
  try {
    // 发起请求，自动携带Authorization鉴权头
    const res = await $fetch(url, {
      ...opts,
      headers: {
        Authorization: token.value ? `Bearer ${token.value}` : '',
        ...opts?.headers
      }
    })

    // 后端业务自定义401（token合法但登录态失效）
    if (res.code === 401) {
      token.value = null
      router.push('/admin/login')
      return null
    }
    return res
  } catch (err){
    // 捕获服务端返回原生HTTP 401（未登录/过期）
    if (err.status === 401) {
      token.value = null
      router.push('/admin/login')
    }
    // 返回null阻断后续逻辑，控制台不再抛出Uncaught Promise报错
    return null
  }
}
