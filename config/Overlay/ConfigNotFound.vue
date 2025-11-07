<template>
  <section class="split_wrapper">
    <div class="centered">
      <h1 class="color_red">404</h1>
      <h3 class="color_black">
        Cannot load app configuration core file. please check with support team.
      </h3>

      <p >{{ errorStack }}</p>

      <button class="_btn_reload" @click="reloadBrowser">Reload</button>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    errorStack: null,
  },
  computed: {
    computeErrorStack() {
      return this.errorStack && this.errorStack.message;
    },
  },
  methods: {
    reloadBrowser() {
      location.reload();
    },
  },
};
</script>


<style lang="scss" scoped>
.split_wrapper {
  background-color: var(--info);
  height: 100%;
  width: 100%;
  position: fixed;

  .color_red {
    color: rgb(249, 0, 0);
  }

  .color_black {
    color: rgb(0, 0, 0);
  }

  .icon {
    font-size: 70px;
    margin-bottom: 30px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-bottom: 100vh solid rgb(0 0 0 / 5%);
    border-left: 600px solid transparent;
    z-index: 2;
  }
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    border-top: 100vh solid rgb(0 0 0 / 5%);
    border-left: 200px solid transparent;
    z-index: 2;
  }
  ._btn_reload {
    background: #c6f6dc;
    color: #0f8145;
    border: none;
    outline: none;
    padding: 10px;
    cursor: pointer;
    box-shadow: 0px 1px 17.72px 5.28px rgb(101 169 119 / 30%);
    border-radius: 5px;
  }
}

.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  transition: all ease-in-out 0.2s;
}
</style>
