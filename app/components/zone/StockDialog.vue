<template>
  <van-popup v-model:show="visible" position="bottom" round :style="{ maxHeight: '90vh' }" @close="$emit('close')">
    <!-- 标题栏 -->
    <van-nav-bar :title="`${zone?.code} 区块管理`" left-arrow @click-left="handleClose" />

    <div class="zone-manage-content">
      <!-- 📋 库存列表：固定显示出库操作 -->
      <van-cell-group inset title="当前库存" v-if="list.length">
        <van-cell v-for="(row, index) in list" :key="index" :title="row.orchid.name" :label="`类型：${row.orchid.type}`">
          <template #value>
            <div class="out-action-row">
              <span class="stock-qty">{{ row.quantity }}盆</span>
              <van-stepper v-model="row._outQty" :min="0" :max="row.quantity" theme="round" button-size="24px"
                input-width="36px" />
              <van-button type="danger" size="mini" :disabled="!row._outQty" :loading="row._outLoading"
                @click="doOut(row)">
                出库
              </van-button>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      <van-empty v-else description="暂无库存" image="search" />

      <!-- 📦 快速入库表单 -->
      <van-cell-group inset title="快速入库" class="inbound-section">
        <van-field v-model="form.name" label="品种" placeholder="输入兰花名" clearable />
        <van-field v-model="form.type" is-link readonly label="类型" placeholder="选择类型" @click="showTypePicker = true" />
        <van-field name="qty" label="数量">
          <template #input>
            <van-stepper v-model="form.qty" :min="1" :max="remain" theme="round" />
          </template>
        </van-field>
        <div class="remain-tip">剩余容量：{{ remain }} 盆</div>
      </van-cell-group>

      <div class="submit-area">
        <van-button type="primary" block round :loading="submitting" @click="doIn">
          确认入库
        </van-button>
      </div>
    </div>
  </van-popup>

  <!-- 类型选择器 -->
  <van-popup v-model:show="showTypePicker" position="bottom" round>
    <van-picker :columns="TYPES.map(t => ({ text: t, value: t }))" @confirm="onTypeConfirm"
      @cancel="showTypePicker = false" />
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const TYPES = ['春兰', '春剑', '蕙兰', '莲瓣兰', '夏兰', '寒兰', '墨兰', '其他']

// JS 中使用运行时声明 defineProps
const props = defineProps({
  zone: {
    type: Object,
    default: null
  }
})

// JS 中使用运行时声明 defineEmits
const emit = defineEmits(['close', 'refresh'])

const visible = ref(true)
const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const showTypePicker = ref(false)
const form = ref({ name: '', type: '春兰', qty: 1 })

const remain = computed(() =>
  props.zone ? props.zone.capacity - props.zone.currentCount : 0
)

// ✅ 统一关闭方法：先隐藏弹窗，再通知父组件
const handleClose = () => {
  visible.value = false
  // 等待 popup 关闭动画完成后再触发父组件逻辑，避免视觉闪烁
  setTimeout(() => emit('close'), 300)
}

const load = async () => {
  if (!props.zone) return
  loading.value = true
  try {
    const data = await $fetch(`/api/zone/${props.zone.code}/detail`)
    list.value = data.map((d) => ({ ...d, _outQty: 0, _outLoading: false }))
  } catch {
    showFailToast('加载库存失败')
  } finally {
    loading.value = false
  }
}

watch(() => props.zone, load, { immediate: true })

const onTypeConfirm = ({ selectedOptions }) => {
  form.value.type = selectedOptions[0]?.value || ''
  showTypePicker.value = false
}

// ✅ 入库成功后自动关闭弹窗
const doIn = async () => {
  if (!form.value.name) {
    showNotify({ type: 'warning', message: '请输入品种名' })
    return
  }
  submitting.value = true
  try {
    await $fetch('/api/stock/in', {
      method: "POST", body: {
        zoneCode: props.zone.code,
        orchidName: form.value.name,
        orchidType: form.value.type,
        quantity: form.value.qty,
      }
    })
    showToast('入库成功')
    emit('refresh')
    handleClose() // ✅ 操作完成，自动关闭
  } catch (e) {
    showFailToast(e?.response?.data?.error || '操作失败')
  } finally {
    submitting.value = false
  }
}

// ✅ 出库成功后自动关闭弹窗
// const doOut = async (row) => {
//   if (!row._outQty || row._outQty <= 0) return
//   console.log(row)
//   row._outLoading = true
//   try {
//     await $fetch('/api/stock/out', {
//       body: {
//         zoneCode: props.zone.code,
//         orchidId: row.Orchid.id,
//         quantity: row._outQty
//       }, 
//       method: "POST"
//     })
//     showToast(`成功出库 ${row._outQty} 盆`)
//     emit('refresh')
//     handleClose() // ✅ 操作完成，自动关闭
//   } catch (e) {
//     showFailToast(e?.response?.data?.error || '操作失败')
//   } finally {
//     row._outLoading = false
//   }
// }
const doOut = async (row) => {
  // 1. 防御性校验：防止 row.Orchid 为空导致 JS 报错中断执行
  console.log(row)
  if (!row.orchid?.id) {
    showFailToast('兰花数据异常，无法出库')
    return
  }

  // 2. 数量校验
  if (!row._outQty || row._outQty <= 0) {
    showFailToast('请输入有效的出库数量')
    return
  }

  row._outLoading = true
  try {
    // 3. 直接使用 Nuxt 原生的 $fetch 发起 POST 请求
    await $fetch('/api/stock/out', {
      method: 'POST',
      body: {
        zoneCode: props.zone.code,
        orchidId: row.orchid.id,
        quantity: row._outQty,
      }
    })

    // 4. 成功后的提示与状态更新
    showToast(`成功出库 ${row._outQty} 盆`)
    emit('refresh')
    handleClose() // ✅ 操作完成，自动关闭
    
  } catch (e) {
    // 5. 捕获 Nuxt/Nitro 抛出的标准错误
    const errorMsg = e?.data?.message || e?.data?.statusMessage || '操作失败'
    showFailToast(errorMsg)
    
  } finally {
    row._outLoading = false
  }
}
</script>

<style scoped>
.zone-manage-content {
  padding: 12px 0 24px;
  max-height: calc(90vh - 46px);
  overflow-y: auto;
}

/* ✅ 固定出库操作行布局 */
.out-action-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stock-qty {
  font-size: 12px;
  color: #969799;
  white-space: nowrap;
}

.inbound-section {
  margin-top: 16px;
}

.remain-tip {
  font-size: 12px;
  color: #999;
  padding: 8px 16px 0;
}

.submit-area {
  padding: 16px;
}
</style>