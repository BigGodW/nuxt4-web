<template>
    <div>
        <div class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 shadow-sm p-0 ">


            <div class="stats" v-if="adminInfo">
                <div class="stat">
                    <div class="stat-title">{{ adminInfo.nickname }}</div>
                    <div class="stat-value">{{ adminInfo.username }}</div>
                    <div class="stat-desc">{{ adminInfo.id }}</div>
                </div>

            </div>
            <div>
                <button @click="logout" class="btn btn-info btn-block p-2">退出</button>
            </div>

        </div>
    </div>
</template>
<script setup>
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