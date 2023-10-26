<template>
  <div class="item_container">
    <span>{{ item.desc }}</span>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

defineProps(["item"]);
// 模拟heavyWork
const heavyWork = [];
for (let i = 0; i < 1000000; i++) {
  heavyWork.push(i);
}

onMounted(() => {
  console.log("mounted");
});

onUnmounted(() => {
  heavyWork.length = 0;
});
</script>

<style lang="scss" scoped>
.item_container {
  height: 50px;
  width: 350px;
  border-top: 1px solid #333;
}
</style>
