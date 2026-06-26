<template>
  <div class="search-panel">
    <!-- 🔍 搜索栏 -->
    <van-search
      v-model="kw"
      placeholder="搜索兰花品种..."
      shape="round"
      @update:model-value="debounceSearch"
      @search="onSearchConfirm"
    />

    <!-- 📋 搜索结果列表 -->
    <van-cell-group v-if="results.length" inset :border="false" class="results">
      <van-cell
        v-for="item in results"
        :key="item.id"
        :title="item.name"
        title-class="result-name"
      >
        <!-- 右侧：类型标签 -->
        <template #value>
          <van-tag type="primary" plain size="medium">{{ item.type }}</van-tag>
        </template>

        <!-- 底部：分布位置 + 总计数量 -->
        <template #label>
          <div class="locs">
            <van-tag
              v-for="loc in item.locations"
              :key="loc.zone"
              plain
              color="#f7f8fa"
              text-color="#969799"
            >
              {{ loc.zone }} ({{ loc.qty }})
            </van-tag>
          </div>
          <div class="total">总计：<b>{{ item.totalQty }}</b> 盆</div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 🈳 空状态 -->
    <van-empty
      v-else-if="searched"
      description="未找到相关兰花"
      image="search"
      :image-size="60"
    />
  </div>
</template>

<script setup>
// ✅ Nuxt 4 自动导入 ref、useDebounceFn、searchOrchid
// 无需任何 import 语句

const kw = ref('')
const results = ref([])
const searched = ref(false)

// ✅ VueUse 防抖替代手动 setTimeout（支持 .cancel()）
const debounceSearch = useDebounceFn(async (val) => {
  if (!val?.trim()) {
    results.value = []
    searched.value = false
    return
  }
  try {
    results.value = await $fetch('/api/search',{query:{keyword: val.trim()}})
  } catch {
    results.value = []
  }
  searched.value = true
}, 300)

// 键盘点击"搜索"按钮时立即触发，跳过防抖等待
const onSearchConfirm = (val) => {
  debounceSearch.cancel?.()
  debounceSearch(val)
}
</script>

<style scoped>
.search-panel {
  margin-bottom: 16px;
  background: #f7f8fa;
}

.results {
  margin-top: 12px;
}

.result-name {
  font-weight: bold;
  font-size: 14px;
}

.locs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.total {
  font-size: 12px;
  color: #969799;
}

.total b {
  color: #323233;
  font-weight: 600;
}
</style>