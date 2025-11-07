<template lang="html">

  <section id="loader">
    <div class="loader" v-show="showLoader">
      <div class="wrapper">
        <i class="fa fa-circle-notch fa-spin fa-3x fa-fw"></i>
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </section>

</template>

<script lang="js">
import axios from "axios";
export default {
  name: 'loader',
  props: [],
  data() {
    return {
      showLoader: false
    }
  },
  mounted() {
    var _this = this;
    var numberOfAjaxCAllPending = 0;
    axios.interceptors.request.use(function (config) {
      // Do something before request is sent
      numberOfAjaxCAllPending++;

      if (!config.hasOwnProperty("params")) {
        _this.showLoader = true;
      }
      else if (!config.params.hasOwnProperty('page') || (config.params.hasOwnProperty('page') && config.params.page == 1)) {
        _this.showLoader = true;
      }
      return config;
    }, function (error) {
      // Do something with request error
      return Promise.reject(error);
    });

    axios.interceptors.response.use(function (response) {
      // Do something with response data
      //        setTimeout(function(){

      numberOfAjaxCAllPending--;

      if (numberOfAjaxCAllPending == 0) {
        _this.showLoader = false;
      }


      //        },4000)
      return response;
    }, function (error) {
      // Do something with response error
      return Promise.reject(error);
    });
  },
  methods: {

  },
  computed: {

  }
}
</script>

<style scoped lang="scss">
.loader {
  background: rgba(256, 256, 256, 0.7);
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  z-index: 200;
}

.wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  margin-left: -55px;
  margin-top: -50px;
}

@for $i from 1 through 71 {
  $deg: 5*$i;

  .wrapper div:nth-child(#{$i}) {
    transform:rotate(#{$deg}deg);
  }
}

.wrapper div {
  position: absolute;
  height: 20px;
  width: 20px;
  transform-origin: 100% 50%;
}

.wrapper div .bar {
  position: absolute;
  height: 1px;
  width: 30px;
  background-color: #070F63;
  left: 0;
  border-radius: 20px;
  transform-origin: right;
  animation: spin 6s linear infinite;
}

.fa-spin {
  color: #070F63;
}

@-webkit-keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
