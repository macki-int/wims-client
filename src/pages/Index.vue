<template>
  <q-page class="flex flex-center">
    <div v-if="viewTable">
     <img
      alt="Wims logo"
      src="~assets/quasar-logo-full.svg"
    >
    </div>
    <div v-else>
    <img
      alt="Wims logo"
      src="~assets/wims-logo-full.svg"
    >
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  viewTable: false
}
</script>
