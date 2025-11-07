<script setup>
// import MyVue3Component from './components/MyVue3Component.vue';
import DataTable from "./components/DataTable/DataTable.vue";

</script>

<template>
  <div>
    App.vue 
    <br> <br>
    <hr>
    <!-- <div class="wrapper">
      <MyVue3Component initial-message="Message from parent component" />
    </div> -->
    <div class="wrapper">
      <DataTable />
    </div>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
