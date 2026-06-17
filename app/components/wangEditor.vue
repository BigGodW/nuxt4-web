<template>
  <ClientOnly>
    <!-- 加载状态判断，完全加载完成才渲染编辑器 -->
    <div v-if="loaded" style="border: 1px solid #ccc">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
      />
      <Editor
        style="height: 500px; overflow-y: hidden;"
        v-model="innerHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
      />
    </div>
    <!-- 加载占位 -->
    <div v-else style="border:1px solid #ccc;height:500px;display:flex;align-items:center;justify-content:center;">
      富文本编辑器加载中...
    </div>
    <template #fallback>
      <div style="border:1px solid #ccc;height:500px;display:flex;align-items:center;justify-content:center;">客户端加载编辑器</div>
    </template>
  </ClientOnly>
</template>

<script setup>
import { ref, shallowRef, onMounted, onBeforeUnmount, watch } from 'vue'

// 响应式加载标记（核心修复：用ref控制渲染时机）
const loaded = ref(false)
let Editor = null
let Toolbar = null
let useQiniuUpload = null
const IMAGE_SAVE_PATH = 'article_img'

// Props 双向绑定
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:modelValue'])

// 编辑器核心实例
const editorRef = shallowRef()
const innerHtml = ref(props.modelValue)
const mode = ref('default')

// 同步父组件传入内容
watch(() => props.modelValue, (newVal) => {
  if (newVal !== innerHtml.value) innerHtml.value = newVal
})
// 内容变更同步给父页面
watch(innerHtml, (val) => {
  emit('update:modelValue', val)
})

// 工具栏/编辑器配置
const toolbarConfig = {}
const editorConfig = {
  placeholder: '请输入文章正文，支持图片、表格、标题、列表...',
  MENU_CONF: {
    uploadImage: {
      server: '',
      maxFileSize: 5 * 1024 * 1024,
      allowedFileTypes: ['image/*'],
      customUpload: async (file, insertImgFn) => {
        if (!useQiniuUpload) return
        const imgUrl = await useQiniuUpload(file, IMAGE_SAVE_PATH)
        if (imgUrl) insertImgFn(imgUrl)
      }
    }
  }
}

// 编辑器创建回调
const handleCreated = (editor) => {
  editorRef.value = editor
}

// 销毁编辑器释放内存
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) editor.destroy()
})

// 客户端异步加载所有依赖
onMounted(async () => {
  if (!process.client) return
  try {
    // 1. 加载编辑器组件
    const editorModule = await import('@wangeditor/editor-for-vue')
    Editor = editorModule.Editor
    Toolbar = editorModule.Toolbar
    // 2. 加载样式
    await import('@wangeditor/editor/dist/css/style.css')
    // 3. 加载七牛上传工具
    const qiniuUtil = await import('~/composables/useQiniuUpload')
    useQiniuUpload = qiniuUtil.useQiniuUpload
    // 全部加载完成，打开渲染开关
    loaded.value = true
  } catch (err) {
    console.error('编辑器加载失败', err)
  }
})
</script>