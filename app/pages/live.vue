<template>
  <ClientOnly >
    <div id="app" class="app min-h-screen bg-slate-100 p-6 text-center font-sans relative">
      <!-- 连接状态悬浮提示 -->
      <div
        class="fixed top-18 right-4 px-4 py-2 rounded-lg text-sm font-bold z-10"
        :class="connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
      >
        {{ connected ? '✅ 已连接服务器' : '❌ 未连接服务器' }}
      </div>

      <!-- 主播端面板 -->
      <div v-if="role === 'admin'" class="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mb-8">
        <button
          @click="sendRise"
          class="px-8 py-4 m-2 rounded-xl text-white font-bold text-lg bg-linear-to-br from-sky-400 to-blue-600 hover:scale-105 transition-transform disabled:opacity-60"
          :disabled="!connected"
        >
          开始抬价 🕒
        </button>
        <button
          @click="sendStop"
          class="px-8 py-4 m-2 rounded-xl text-white font-bold text-lg bg-linear-to-br from-red-400 to-red-600 hover:scale-105 transition-transform disabled:opacity-60"
          :disabled="!connected"
        >
          停止抬价 🛑
        </button>
        <div
          v-if="adminTipShow"
          class="mt-4 px-4 py-2 rounded-lg font-bold text-sm inline-block"
          :class="adminTipColor === 'tip-blue' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'"
        >
          {{ adminTipText }}
        </div>
      </div>

      <!-- 客服端 -->
      <div v-else class="max-w-4xl mx-auto">
        <!-- 自定义倒计时模块 -->
        <div class="bg-sky-50 rounded-2xl shadow-lg p-10 mb-8">
          <h3 class="text-2xl text-blue-800 font-semibold mb-4">⏱ 本地自定义倒计时</h3>
          <!-- 时分输入框 -->
          <div class="flex items-center justify-center gap-3 mb-5">
            <div class="flex flex-col items-center gap-1">
              <label class="text-sm text-gray-700">分钟</label>
              <input
                v-model.number="inputMin"
                type="number"
                min="0"
                max="99"
                placeholder="0"
                @input="handleSetTime"
                class="w-20 h-11 text-center text-xl border border-sky-300 rounded-lg outline-none focus:border-blue-600"
              />
            </div>
            <span class="text-3xl font-bold text-blue-800">:</span>
            <div class="flex flex-col items-center gap-1">
              <label class="text-sm text-gray-700">秒</label>
              <input
                v-model.number="inputSec"
                type="number"
                min="0"
                max="59"
                placeholder="0"
                @input="handleSetTime"
                class="w-20 h-11 text-center text-xl border border-sky-300 rounded-lg outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <!-- 倒计时数字展示 -->
          <div class="text-5xl font-bold text-blue-900 my-4">{{ localMin }}:{{ localSec }}</div>
          <!-- 操作按钮 -->
          <div class="flex flex-wrap justify-center gap-2">
            <button
              @click="localStart"
              :disabled="localRunning"
              class="px-8 py-4 rounded-xl text-white font-bold text-lg bg-linear-to-br from-sky-400 to-blue-600 hover:scale-105 transition-transform disabled:opacity-60"
            >
              开始
            </button>
            <button
              @click="localPause"
              :disabled="!localRunning"
              class="px-8 py-4 rounded-xl text-white font-bold text-lg bg-linear-to-br from-red-400 to-red-600 hover:scale-105 transition-transform disabled:opacity-60"
            >
              暂停
            </button>
            <button
              @click="localReset"
              class="px-8 py-4 rounded-xl text-white font-bold text-lg bg-linear-to-br from-gray-500 to-gray-700 hover:scale-105 transition-transform"
            >
              重置
            </button>
          </div>
        </div>

        <!-- 主播下发抬价倒计时 -->
        <div
          v-if="showBid"
          class="p-12 rounded-2xl border-2 border-amber-400 bg-linear-to-br from-amber-50 to-amber-200 bid-box"
        >
          <div class="text-2xl font-bold text-orange-700 mb-3">💡 抬价倒计时！</div>
          <div class="text-5xl font-bold text-red-700">{{ count }}</div>
        </div>

        <!-- 停止抬价提示 -->
        <div
          v-else-if="showStop"
          class="p-12 rounded-2xl border-2 border-green-500 bg-linear-to-br from-green-50 to-green-200 text-2xl font-bold text-green-800"
        >
          ✅ 已停止抬价
        </div>

        <!-- 等待提示 -->
        <div v-else class="p-12 text-gray-500 text-lg">等待主播发起抬价指令...</div>
      </div>

      <!-- 角色切换按钮 -->
      <div class="mt-12">
        <button
          @click="role = 'admin'"
          class="btn m-2"
          :class="{ 'bg-sky-500  border-sky-500': role === 'admin' }"
        >
          主播端
        </button>
        <button
          @click="role = 'user'"
          class="btn m-2"
          :class="{ 'bg-sky-500  border-sky-500': role === 'user' }"
        >
          客服端
        </button>
      </div>

      <!-- 隐藏音频 -->
      <audio ref="bellAudioRef" src="/mp3/time.mp3" preload="auto" />
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

useHead({
  script: [
    { src: 'https://cdn.socket.io/4.7.2/socket.io.min.js', defer: true },
  ],
})

// 角色与socket连接状态
const role = ref('user')
const showBid = ref(false)
const showStop = ref(false)
const count = ref(5)
const connected = ref(false)

// 主播提示
const adminTipShow = ref(false)
const adminTipText = ref('')
const adminTipColor = ref('')

let timer = null
let tipTimer = null
let socket = null

// 音频
const bellAudioRef = ref(null)
const playBell = async () => {
  await nextTick()
  if (!bellAudioRef.value) return
  bellAudioRef.value.currentTime = 0
  bellAudioRef.value.play().catch(e => console.log('音频播放限制', e))
}

// 本地倒计时配置
const inputMin = ref(1)
const inputSec = ref(0)
const localTotalSec = ref(60)
const localLeftSec = ref(60)
const localRunning = ref(false)
let localTimer = null

const localMin = ref('00')
const localSec = ref('00')
const formatLocalTime = () => {
  const m = Math.floor(localLeftSec.value / 60)
  const s = localLeftSec.value % 60
  localMin.value = String(m).padStart(2, '0')
  localSec.value = String(s).padStart(2, '0')
}

// 修改输入框更新时长
const handleSetTime = () => {
  let m = Number(inputMin.value) || 0
  let s = Number(inputSec.value) || 0
  m = Math.max(0, m)
  s = Math.max(0, Math.min(59, s))
  inputMin.value = m
  inputSec.value = s
  const total = m * 60 + s
  localTotalSec.value = total
  if (!localRunning.value) {
    localLeftSec.value = total
    formatLocalTime()
  }
}

// 倒计时控制
const localStart = () => {
  if (localRunning.value || localLeftSec.value <= 0) return
  localRunning.value = true
  localTimer = setInterval(() => {
    localLeftSec.value--
    formatLocalTime()
    if (localLeftSec.value <= 0) {
      localPause()
      playBell()
    }
  }, 1000)
}
const localPause = () => {
  clearInterval(localTimer)
  localTimer = null
  localRunning.value = false
}
const localReset = () => {
  localPause()
  localLeftSec.value = localTotalSec.value
  formatLocalTime()
  inputMin.value = Math.floor(localTotalSec.value / 60)
  inputSec.value = localTotalSec.value % 60
}
formatLocalTime()

// 主播发送指令
const showAdminTip = (text, color) => {
  adminTipText.value = text
  adminTipColor.value = color
  adminTipShow.value = true
  clearTimeout(tipTimer)
  tipTimer = setTimeout(() => adminTipShow.value = false, 3000)
}
const sendRise = () => {
  if (!connected.value) return showAdminTip('❌ 未连接服务器，无法发送指令', 'tip-red')
  socket.emit('rise')
  showAdminTip('✅ 已发送：开始抬价指令', 'tip-blue')
}
const sendStop = () => {
  if (!connected.value) return showAdminTip('❌ 未连接服务器，无法发送指令', 'tip-red')
  socket.emit('stop')
  showAdminTip('🛑 已发送：停止抬价指令', 'tip-red')
}

// 抬价倒计时逻辑
const startBid = () => {
  clearAll()
  showBid.value = true
  document.body.classList.add('blinking')
  document.body.classList.remove('stop-theme')
  count.value = 5
  timer = setInterval(() => {
    count.value--
    if (count.value <= 0) stopBid()
  }, 1000)
}
const stopBid = () => {
  clearAll()
  showStop.value = true
  document.body.classList.add('stop-theme')
  setTimeout(() => showStop.value = false, 5000)
}
const clearAll = () => {
  clearInterval(timer)
  timer = null
  showBid.value = false
  document.body.classList.remove('blinking')
}

// 初始化Socket
onMounted(() => {
  const initSocket = () => {
    if (!window.io) return setTimeout(initSocket, 100)
    socket = io('http://47.109.179.80:3001')
    socket.on('connect', () => connected.value = true)
    socket.on('disconnect', () => connected.value = false)
    socket.on('rise', startBid)
    socket.on('stop', stopBid)
  }
  initSocket()
})

// 销毁清理
onUnmounted(() => {
  clearAll()
  clearTimeout(tipTimer)
  localPause()
  if (socket) socket.disconnect()
})
</script>

<style>
/* 全局动画 Tailwind 无法控制 body 动画，单独全局样式 */
body {
  min-height: 100vh;
  transition: all 0.3s ease;
  background: #f5f7fa;
}
@keyframes blink {
  0% { background: #fff3e0; }
  50% { background: #f14242; }
  100% { background: #fff3e0; }
}
@keyframes blink2 {
  0% { background: #f14242; }
  50% { background: #fff3e0; }
  100% { background: #f14242; }
}
body.blinking {
  animation: blink 0.6s infinite alternate;
}
.bid-box {
  animation: blink2 0.6s infinite alternate;
}
body.stop-theme {
  background: #e8f5e9;
  transition: all 0.4s;
}
</style>