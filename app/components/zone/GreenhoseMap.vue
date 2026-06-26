<template>
  <div class="map-container">
    <div
      v-for="z in sortedZones"
      :key="z.code"
      class="cell"
      :class="[heat(z), { 'cell-disabled': isDisabled(z) }]"
      @click="!isDisabled(z) && $emit('select', z)"
    >
      <b>{{ z.code.trim() }}</b>
      <small v-if="z.currentCount > 0">{{ z.currentCount }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['zones']);
defineEmits(['select']);

// 禁用列表：纯大写无空格编码
const DISABLED_CODES = new Set([
  'M4', 'N4', 'M5', 'N5', 'M6', 'N6', 'M7', 'N7',
  'D16', 'E16', 'F16', 'D17', 'E17', 'F17',
  'M19', 'N19', 'M20', 'N20', 'M21', 'N21'
]);

// 统一清理code：去除首尾空格+转大写
const getCleanCode = (rawCode) => {
  if (!rawCode) return '';
  return rawCode.trim().toUpperCase();
};

// 传入整个区块对象，统一清理编码判断禁用
const isDisabled = (zone) => {
  const cleanCode = getCleanCode(zone.code);
  return DISABLED_CODES.has(cleanCode);
};

// 列映射
const COL_MAP = {
  A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, I:9, J:10, K:11, L:12, M:13, N:14
};

const sortedZones = computed(() => {
  if (!props.zones) return [];
  return [...props.zones].sort((a, b) => {
    const codeA = a.code.trim();
    const codeB = b.code.trim();

    const getLetterNum = (str) => {
      const letter = str.match(/^[A-Z]/)[0];
      const num = Number(str.match(/\d+/)[0]);
      return { letter, num };
    };

    const aInfo = getLetterNum(codeA);
    const bInfo = getLetterNum(codeB);

    if (aInfo.num !== bInfo.num) {
      return aInfo.num - bInfo.num;
    }
    return aInfo.letter.localeCompare(bInfo.letter);
  });
});

// 颜色状态：先判断禁用
const heat = (z) => {
  // 统一用清理后的编码判断禁用
  if (isDisabled(z)) return 'c-none';
  if (!z.capacity) return 'c-empty';
  const r = z.currentCount / z.capacity;
  if (r === 0) return 'c-empty';
  if (r < 0.5) return 'c-low';
  if (r < 0.9) return 'c-mid';
  return 'c-full';
};
</script>

<style scoped>
.map-container {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  grid-row-gap: 4px;
  grid-column-gap: 0;
  width: 100%;
}

/* 每行第9列(I) 右侧100px间距 */
.cell:nth-child(14n+9) {
  margin-right: 10px;
}

.cell {
  cursor: pointer;
  text-align: center;
  font-size: 12px;
  transition: all 0.2s;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 40px;
}

.cell:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
  z-index: 1;
}

/* 禁用样式 优先级拉高 */
.cell-disabled {
  cursor: not-allowed !important;
  pointer-events: none !important;
  transform: none !important;
  box-shadow: none !important;
}

/* 原有状态色 */
.c-empty { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.c-low   { background: #fefce8; color: #854d0e; border: 1px solid #fef08a; }
.c-mid   { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
.c-full  { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

/* 禁用区块样式 c-none */
.c-none {
  background: #f5f5f5;
  color: #999;
  border: 1px solid #e5e5e5;
}

@media (max-width: 375px) {
  .cell {
    font-size: 10px;
    min-height: 32px;
  }
  .cell:nth-child(14n+9) {
    margin-right: 10px;
  }
}
</style>