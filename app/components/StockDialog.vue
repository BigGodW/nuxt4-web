<template>
  <!-- 遮罩 -->
  <div v-if="visible" class="mask" @click.self="handleClose">
    <!-- 弹窗容器 -->
    <div class="dialog-box">
      <div class="dialog-header">
        <h3>{{ zone?.code }} 区块管理</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="dialog-body">
        <!-- 库存表格 -->
         {{ mylist }}
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>品种</th>
                <th>类型</th>
                <th>数量</th>
                <th>出库操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in list" :key="row.Orchid.id">
                <td>{{ row.Orchid.name }}</td>
                <td>{{ row.Orchid.type }}</td>
                <td>{{ row.quantity }}</td>
                <td>
                  <input
                    v-model.number="row._outQty"
                    type="number"
                    min="0"
                    :max="row.quantity"
                    class="num-input"
                  />
                  <button
                    class="btn danger-btn"
                    @click="doOut(row)"
                    :disabled="!row._outQty"
                  >
                    确认出库
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr class="divider" />

        <!-- 入库表单 -->
        <div class="form-block">
          <h4>快速入库</h4>
          <div class="form-row">
            <label>品种</label>
            <input v-model="form.name" placeholder="输入兰花名" />
          </div>
          <div class="form-row">
            <label>类型</label>
            <select v-model="form.type">
              <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="form-row">
            <label>数量</label>
            <input
              v-model.number="form.qty"
              type="number"
              min="1"
              :max="remain"
            />
          </div>
          <div class="form-row">
            <button class="btn primary-btn" @click="doIn" :disabled="submitting">
              {{ submitting ? '提交中...' : '入库' }}
            </button>
          </div>
        </div>

        <div class="tip-text">剩余容量：{{ remain }} 盆</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const TYPES = ['春兰', '春剑', '蕙兰', '莲瓣兰', '夏兰', '寒兰', '墨兰', '其他']
const props = defineProps(['zone'])
const emit = defineEmits(['close', 'refresh'])

const visible = ref(true)
const list = ref([])
const mylist = ref([])
const loading = ref(false)
const submitting = ref(false)
const form = ref({ name: '', type: TYPES[0], qty: 1 })

const remain = computed(() => props.zone ? props.zone.capacity - props.zone.currentCount : 0)

// 简易提示替代 ElMessage
function showMsg(text, type = 'info') {
  alert(text)
}

// 加载区块库存
const load = async () => {
  if (!props.zone) return
  loading.value = true
  try {
    const data = await $fetch(`/api/zone/${props.zone.code}/detail`)
    mylist.value = data
    list.value = data.map(d => ({ ...d, _outQty: 0 }))
  } catch (err) {
    showMsg('加载区块详情失败', 'error')
  } finally {
    loading.value = false
  }
}

watch(() => props.zone, load, { immediate: true })

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 入库
const doIn = async () => {
  if (!form.value.name) return showMsg('请输入品种名')
  if (!props.zone) return
  submitting.value = true
  try {
    await $fetch('/api/inventory/in', {
      method: 'POST',
      body: {
        zoneCode: props.zone.code,
        orchidName: form.value.name,
        orchidType: form.value.type,
        quantity: form.value.qty
      }
    })
    showMsg('入库成功')
    form.value = { name: '', type: TYPES[0], qty: 1 }
    emit('refresh')
    load()
  } catch (e) {
    showMsg(e.data?.error || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 出库
const doOut = async (row) => {
  if (!row._outQty) return showMsg('请输入出库数量')
  try {
    await $fetch('/api/inventory/out', {
      method: 'POST',
      body: {
        zoneCode: props.zone.code,
        orchidId: row.Orchid.id,
        quantity: row._outQty
      }
    })
    showMsg('出库成功')
    emit('refresh')
    load()
  } catch (e) {
    showMsg(e.data?.error || '操作失败')
  }
}
</script>

<style scoped>
.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.dialog-box {
  width: 90%;
  max-width: 1000px;
  background: #fff;
  border-radius: 6px;
  max-height: 90vh;
  overflow-y: auto;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.close-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}
.dialog-body {
  padding: 16px;
}
.table-wrap {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #eee;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #eee;
  padding: 6px 8px;
  font-size: 14px;
}
th {
  background: #f7f7f7;
}
.num-input {
  width: 80px;
  padding: 4px;
  margin-right: 6px;
}
.divider {
  margin: 16px 0;
  border: none;
  border-top: 1px solid #eee;
}
.form-block h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
}
.form-row {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-row label {
  width: 70px;
}
.form-row input, .form-row select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}
.btn {
  padding: 5px 12px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
}
.primary-btn {
  background: #1677ff;
  color: #fff;
}
.danger-btn {
  background: #f53f3f;
  color: #fff;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.tip-text {
  font-size:12px;
  color:#999;
  margin-top:4px;
}
</style>