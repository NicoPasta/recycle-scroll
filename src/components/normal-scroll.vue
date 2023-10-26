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
        v-for="view of _views"
        :key="view.index"
        class="rscroll__item-view"
        :style="computeViewPosition(view)"
      >
        <slot
          v-bind="{
            item: view.item,
            index: view.index,
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

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },

  itemSize: {
    type: Number,
    default: null,
  },

  buffer: {
    type: Number,
    default: 200,
  },
});

// 是否完成滚动
let scrollDirty = false;

// 展示池
const _views = reactive([]);

// 视图容器
const rscroll__container = ref();
// 滚动总高度
const totalSize = ref(0);
// 上次滚动的位置
let _lastUpdateScrollPosition = 0;

let ready = false;
const computeViewPosition = (view) => {
  // 计算完后开始
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

const createView = (item) => ({
  index: item.id,
  item,
  position: 0,
});

const updateScrollView = (checkPositionDiff = false) => {
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

  //  寻找start和end之间的元素
  _views.length = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const item = props.items[i];
    const view = createView(item);
    // 重新计算position
    view.position = i * itemSize;
    _views.push(view);
  }

  _views.sort((a, b) => a.index - b.index);
};

watch(
  () => props.items,
  () => {
    updateScrollView();
  }
);

onMounted(() => {
  updateScrollView();
  ready = true;
});

const handleScroll = () => {
  if (!scrollDirty) {
    scrollDirty = true;
    requestAnimationFrame(() => {
      scrollDirty = false;
      updateScrollView(true);
    });
  }
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
