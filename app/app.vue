<template>
  <div>
    <Header />
    <main>
      <NuxtPage />
    </main>
    <Footer />
    <NuxtRouteAnnouncer />
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
</script>

<style>

body {
  margin: 0;
  font-family: sans-serif;
}
</style>

