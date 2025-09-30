<template>
  <header>
    <nav class="container">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/products">Products</NuxtLink>
      <NuxtLink to="/about">About</NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 60px;
}
</style>
