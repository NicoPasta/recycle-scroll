<template>
  <div
    @scroll.passive="handleScroll"
    class="rscroll__container"
    ref="rscroll__container"
  >
    <div
      ref="wrapper"
      class="rscroll__item-wrapper"
      :style="{ 'min-height': totalSize + 'px' }"
    >
      <div
        v-for="view of _pool"
        :key="view.meta.id"
        class="rscroll__item-view"
        :style="computeViewPosition(view)"
      >
        <slot
          v-bind="{
            item: view.item,
            index: view.meta.index,
            visiable: view.meta.used,
          }"
        >
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  markRaw,
  onMounted,
  onUpdated,
  reactive,
  ref,
  watch,
} from "vue";

import { LRUCache } from "../utils/LRUcache.js";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },

  keyField: {
    type: String,
    default: "id",
  },

  itemSize: {
    type: Number,
    default: null,
  },

  typeField: {
    type: String,
    default: "type",
  },
  buffer: {
    type: Number,
    default: 200,
  },

  capacity: {
    type: Number,
    default: 10,
  },
});

// viewid
let uid = 0;

// 计算完毕
let ready = false;

// 是否完成滚动
let scrollDirty = false;

// 视图区的item对应的起始位置
let _lastStartIndex = 0;
let _lastEndIndex = 0;
// 视图池
const _pool = ref([]);
// 展示池
const _views = new Map();
// 回收池
const recycledPools = new LRUCache(props.capacity);
// const recycledPools = new Map();

// 视图容器
const rscroll__container = ref();
// 滚动总高度
const totalSize = ref(0);
// 上次滚动的位置
let _lastUpdateScrollPosition = 0;

const computeViewPosition = (view) => {
  if (ready) {
    return {
      transform: `translateY(${view.position}px)`,
    };
  }
};

const getPosition = () => {
  return {
    start: rscroll__container.value.scrollTop,
    end:
      rscroll__container.value.scrollTop +
      rscroll__container.value.clientHeight,
  };
};

// 创建一个——view包装
const createView = (pool, index, item, key, type) => {
  const meta = markRaw({
    id: uid++,
    // 列表的index，也作为pool中排序的依据
    index,
    used: true,
    // key
    key,
    // item对应的组件
    type,
  });
  const view = reactive({
    item,
    position: 0,
    meta,
  });
  pool.value.push(view);
  return view;
};

const getRecycledPool = (type) => {
  let pool = recycledPools.get(type);
  return pool;
};

const getRecycledView = (type) => {
  let recycledPool = getRecycledPool(type);
  if (recycledPool?.length) {
    const view = recycledPool.pop();
    view.meta.used = true;
    return view;
  } else {
    return null;
  }
};

const removeAndRecycleView = (view) => {
  let recycledPool = getRecycledPool(view.meta.type);

  let abandoned;
  if (!recycledPool) {
    recycledPool = [];
    abandoned = recycledPools.set(view.meta.type, recycledPool);
  }

  if (abandoned?.length) {
    _pool.value = _pool.value.filter((v) => {
      if (abandoned.indexOf(v) !== -1) {
        return false;
      }
      return true;
    });
  }

  recycledPool.push(view);
  view.meta.used = false;
  view.position = -9999;
  _views.delete(view.meta.key);
};

const removeAndRecycleAllViews = () => {
  _views.clear();
  recycledPools.clear();
  // 进入缓存，缓存策略由LRU处理
  _pool.value.forEach((v) => {
    removeAndRecycleView(v);
  });
};

const updateScrollView = (itemChanged, checkPositionDiff = false) => {
  let startIndex, endIndex;
  const itemSize = props.itemSize;

  if (!itemSize) {
    startIndex = endIndex = totalSize.value = 0;
    return;
  } else {
    const pos = getPosition();
    if (checkPositionDiff) {
      let positionDiff = pos.start - _lastUpdateScrollPosition;
      if (positionDiff < 0) positionDiff = -positionDiff;
      // 滚动距离不到一个item，不更新
      if (
        (itemSize === null && positionDiff < props.itemSize) ||
        positionDiff < itemSize
      ) {
        return;
      }
    }
    _lastUpdateScrollPosition = pos.start;

    // 带上buffer的视图区开始和结束
    totalSize.value = itemSize * props.items.length;
    let bufferStart = pos.start - props.buffer;
    let bufferEnd = pos.end + props.buffer;
    bufferStart < 0 && (bufferStart = 0);
    bufferEnd > totalSize.value && (bufferEnd = totalSize.value);

    // 计算start和endIndex
    // 往小了取，第一个item有一部分在视图外
    startIndex = Math.floor(bufferStart / itemSize);
    // 同理，往大了取，超出bufferEnd的第一个是结束的item
    endIndex = Math.ceil(bufferEnd / itemSize);
    // 边界
    startIndex < 0 && (startIndex = 0);
    endIndex > props.items.length && (endIndex = props.items.length);
  }

  // 上下滚动都能够保证滚动前后有重复视图，说明是连续的滚动
  const continuous = startIndex <= _lastEndIndex && endIndex >= _lastStartIndex;

  if (!continuous || itemChanged) {
    // 全部回收，重新计算
    removeAndRecycleAllViews();
  } else {
    // 计算被隐藏的item
    for (let i = 0; i < _pool.value.length; i++) {
      const view = _pool.value[i];
      // 在visible视图中找缓存
      if (view.meta.used) {
        const visiable =
          view.meta.index >= startIndex && view.meta.index < endIndex;
        if (!visiable) {
          removeAndRecycleView(view);
        }
      }
    }
  }

  // 计算view和view位置
  let view, type;
  for (let i = startIndex; i < endIndex; i++) {
    const item = props.items[i];
    const key = i;
    // 找index是不是在view池中
    view = _views.get(key);
    if (!view) {
      type = item[props.typeField];
      view = getRecycledView(type);
      if (view) {
        view.meta.key = key;
        // 重置index
        view.meta.index = i;
        view.item = item;
      } else {
        view = createView(_pool, i, item, key, type);
      }
      _views.set(key, view);
    } else {
      if (view.item !== item) {
        // 防止key没变但引用发生变化
        view.item = item;
      }
    }

    // 重新计算position
    view.position = i * itemSize;
  }

  // 保存上次滚动的index，用于判断滚动距离
  _lastStartIndex = startIndex;
  _lastEndIndex = endIndex;

  // 排序，保证视图内的DOM连续
  _pool.value.sort((a, b) => a.meta.index - b.meta.index);
};

watch(
  () => props.items,
  () => {
    updateScrollView(true);
  }
);

onMounted(() => {
  updateScrollView(true);
  ready = true;
});

const handleScroll = () => {
  requestAnimationFrame(() => {
    updateScrollView(false, true);
  });
};
</script>

<style scoped>
.rscroll__container {
  position: relative;
  overflow-y: auto;
  height: 100%;
  width: 100%;
}

.rscroll__item-wrapper {
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.rscroll__item-view {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}
</style>
