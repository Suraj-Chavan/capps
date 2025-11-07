<template lang="html">

  <section id="miniloader" ref="miniloader">
    <div class="Aligner" :style="{ height: height + 'px' }" v-if="show">
      <div class="infiniteLoader Aligner-item">
        <i class="fa fa-circle-notch fa-spin fa-3x fa-fw"></i>
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </section>

</template>

<script lang="js">
export default {
  name: 'loadermini',
  props: ['show'],
  data() {
    return {
      height: 0
    }
  },
  watch: {
    show() {
      this.height = this.$refs.miniloader.parentElement.clientHeight - 20;
    }
  },
  mounted() {
    this.height = this.$refs.miniloader.parentElement.clientHeight - 20;
  },
  methods: {

  },
  computed: {

  }
}
</script>

<style scoped lang="scss">
.Aligner {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  margin-top: 15px;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  height: 85%;
}

.Aligner-item {
  max-width: 100%;
}
</style>
