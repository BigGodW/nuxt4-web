<template>
  <div class="article-form" style="width:90%;margin:2rem auto;">
    <h2>新增文章</h2>

    <div class="form-item" style="margin:12px 0;">
      <label>文章标题</label>
      <input
        v-model="form.title" class="input"
        style="width:100%;padding:8px;margin-top:4px;font-size:16px;"
        placeholder="请输入文章标题"
      />
    </div>
    <div class="form-item" style="margin:12px 0;">
      <label>分类</label>
      <select class="select" v-model.number="form.categoryId" style="width:100%;padding:8px;margin-top:4px;">
        <option value="">请选择分类</option>
        <option v-for="c in categoryList" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div class="form-item" style="margin:12px 0;">
      <label>标签（多选）</label>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:6px;">
        <label v-for="tag in tagList" :key="tag.id">
          <input
            type="checkbox" class="checkbox"
            v-model.number="form.tagIdList"
            :value="tag.id"
          />
          {{ tag.name }}
        </label>
      </div>
    </div>
    <div class="form-item" style="margin:12px 0;">
      <label>封面图链接（选填）</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input class="input"
          v-model="form.cover"
          style="flex:1;padding:8px;margin-top:4px;"
          placeholder="图片网络地址"
        />
        <input type="file"  ref="coverFileRef" accept="image/*" style="display:none;" @change="uploadCover"/>
        <button class="btn btn-info" @click="$refs.coverFileRef.click()">上传封面</button>
      </div>
      <div v-if="form.cover" class="flex justify-center items-center">
        <img :src="form.cover + '?imageView2/0/w/200'" class="object-none object-center w-56 aspect-square" />
        <button class="btn btn-sm btn-error" @click="form.cover= ''">删除</button>
      </div>
    </div>

    <div class="form-item" style="margin:12px 0;">
      <label>发布状态</label>
      <select v-model.number="form.status" style="padding:6px;margin-left:8px;">
        <option value="1">正常发布</option>
        <option value="0">草稿</option>
        <option value="2">下架</option>
      </select>
    </div>
    <div class="form-item" style="margin:16px 0;">
      <label>文章正文</label>
      <WangEditor v-model="form.content" />
    </div>
  

    <button
      @click="submit"
      style="padding:10px 30px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;"
    >
      提交保存文章
    </button>

    <p style="color:red;margin-top:10px;" v-if="errMsg">{{ errMsg }}</p>
  </div>
</template>
<script setup>
definePageMeta({
  layout: 'admin',
})
const router = useRouter()
const route = useRoute()
const errMsg = ref('')
const form = ref({
  title: '',
  categoryId: '',
  tagIdList: [],
  cover: '',
  content: '',
  status: 1
})
const articleId = route.params.id

// 页面加载回显数据
async function getDetail() {
  const res = await useAdminFetch(`/api/admin/article/${articleId}`)
  if (!res || res.code !== 200) return
  const data = res.data
  form.value = {
    title: data.title,
    categoryId: data.category?.id || '',
    tagIdList: data.tags.map(t => t.id), // 回显已选标签ID数组
    cover: data.cover || '',
    content: data.content,
    status: data.status
  }
}


// 分类、标签列表
const categoryList = ref([])
const tagList = ref([])
async function getBaseData() {
  const cateRes = await useAdminFetch('/api/admin/category/list')
  if (cateRes.code === 200) categoryList.value = cateRes.data

  const tagRes = await useAdminFetch('/api/admin/tag/list')
  if (tagRes.code === 200) tagList.value = tagRes.data
}
getBaseData()


// 提交编辑
async function submit() {
  errMsg.value = ''
  const res = await useAdminFetch(`/api/admin/article/${articleId}`, {
    method: 'PUT',
    body: form.value
  })
  if (!res) return
  if (res.code !== 200) {
    errMsg.value = res.msg
    return
  }
  alert('修改成功')
  router.push('/admin/article/list')
}

getDetail()
</script>