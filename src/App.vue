<script setup>
import RecycledScrollDemo from "./views/recycled-scroll-demo.vue";
import NormalScrollDemo from "./views/normal-scroll-demo.vue";
</script>

<template>
  <!-- vue匹配不到key时会执行原地更新算法，导致如果DOM类型不匹配DOM更新操作 -->
  <NormalScrollDemo></NormalScrollDemo>
  <RecycledScrollDemo></RecycledScrollDemo>
</template>

<style scoped></style>
