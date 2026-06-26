<template>
  <div class="warehouse">
    <!-- ✅ 使用 van-sticky 替代手写 position:sticky -->
    <van-sticky :offset-top="0" z-index="99">
      <div class="sticky-header">
        <h2 class="page-title">兰花仓库管理系统</h2>
        <ZoneSearchPanel />
      </div>
    </van-sticky>

    <!-- 🗺️ 大棚平面图区域 -->
    <section class="map-section">
      <ZoneGreenhoseMap :zones="zones" @select="openZone" />
    </section>

    <!-- 📦 区块管理弹窗 -->
    <ZoneStockDialog
      v-if="activeZone"
      :zone="activeZone"
      @close="activeZone = null"
      @refresh="loadZones"
    />
  </div>
</template>

<script setup>
// ✅ Nuxt 4 自动导入 ref, onMounted, getZones
// 无需任何 import 语句

const zones = ref([])
const activeZone = ref(null)

const loadZones = async () => {
  try {
    zones.value = await $fetch('/api/zone/map')
  } catch {
    showFailToast('加载大棚数据失败')
  }
}

const openZone = (z) => {
  activeZone.value = z
}

onMounted(loadZones)
</script>

<style scoped>
.warehouse {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f7f8fa;
}

.sticky-header {
  background: #fff;
  padding: 12px 16px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #323233;
  margin: 0 0 8px;
  line-height: 1.4;
}

.map-section {
  padding: 12px 16px 24px;
}
</style>