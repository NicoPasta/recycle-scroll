<template>
  <p class="item_container">
    {{ item.desc }}
  </p>
</template>

<script setup>
import { onMounted } from "vue";

defineProps(["item"]);
// 模拟重负载
const heavyWork = [];
for (let i = 0; i < 1000000; i++) {
  heavyWork.push(i);
}
onMounted(() => {
  console.log("mounted");
});
</script>

<style lang="scss" scoped>
.item_container {
  height: 50px;
  width: 350px;
  border-top: 1px solid #333;
  margin: 0;
}
</style>
