<template>
  <div>
    <div class="describe">
      list更新时，复用之前渲染好的组件，只在新组件加载时闪烁
    </div>
    <div class="demo_container">
      <RecycledScroll
        :items="itemList"
        :itemSize="50"
        :capacity="5"
        typeField="type"
        v-slot="{ item }"
      >
        <!-- 不同条件下渲染不同组件 -->
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
      </RecycledScroll>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import RecycledScroll from "../components/recycled-scroll.vue";
import { getData } from "../data/index.js";
import ListItemA from "./list-item-a.vue";
import ListItemB from "./list-item-b.vue";

const itemList = ref([]);

// 模拟异步data
getData().then((res) => {
  itemList.value = res;
});
</script>

<style lang="scss" scoped></style>
