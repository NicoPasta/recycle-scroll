<template>
  <div>
    <div class="describe">
      传统虚拟滚动，list数据更新导致组件重复挂载，滚动时闪烁
    </div>
    <div class="demo_container">
      <NormalScroll :items="itemList" :itemSize="50" v-slot="{ item }">
        <!-- 不同条件下渲染组件 -->
        <ListItemA
          v-if="item.type === 'A'"
          :key="item.id"
          :item="item"
        ></ListItemA>
        <ListItemB
          v-if="item.type === 'B'"
          :key="item.id"
          :item="item"
        ></ListItemB>
      </NormalScroll>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getData } from "../data/index.js";
import ListItemA from "./list-item-a.vue";
import ListItemB from "./list-item-b.vue";
import NormalScroll from "../components/normal-scroll.vue";

const itemList = ref([]);

// 模拟异步data
getData().then((res) => {
  itemList.value = res;
});
</script>

<style lang="scss" scoped></style>
