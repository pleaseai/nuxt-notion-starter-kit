<script setup lang="ts">
// Default layout with NotionHeader and NotionFooter
</script>

<template>
  <div class="notion-app">
    <NotionHeader />

    <main class="notion-main">
      <slot />
    </main>

    <NotionFooter />
  </div>
</template>

<style scoped>
.notion-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.notion-main {
  flex: 1;
}
</style>
