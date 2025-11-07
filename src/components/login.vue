<template>
<section class="login_wrap">
  <div class="bar"></div>
        <b-form  @submit="onSubmit" @reset="onReset">
            <img src="@/assets/img/credence_w.png" alt="" height="70"/>
            <b-card shadow-lg header="iDeal Funds">
              
              <b-form-group id="input-group-1" label="User name:" label-for="username">
                <b-form-input
                  id="username"
                  v-model="form.username"
                  type="text"
                  required
                  placeholder="Enter your name"
                ></b-form-input>
                <span class="bar"></span>
              </b-form-group>
              <b-form-group id="input-group-2" label="Password:" label-for="password">
                <b-form-input
                  id="Password"
                  v-model="form.password"
                  type="password"
                  required
                  placeholder="Enter your password"
                ></b-form-input>
              </b-form-group>
              <template  v-slot:footer>
                <b-button type="reset" variant="outline-secondary">Reset</b-button>
                <b-button type="submit" variant="primary">Submit</b-button>
                </template>
            </b-card>
        </b-form>
</section>
</template>


<script>
export default {
  data() {
    return { form: { username: "", password: "" } };
  },
  mounted() {},

  methods: {
    onSubmit() {
      this.$credCAPI.login(this.form).then(loggedin => {
        if (loggedin) this.$router.push("/");
        else
          this.$bvToast.toast(`Please enter correct credentials`, {
            title: "Application Login",
            toaster : 'b-toaster-top-center',
            autoHideDelay: 5000,
            appendToast: false
          });
      });
    },
    onReset() {}
  }
};
</script>

<style lang="scss" scoped>
.login_wrap{
  background:linear-gradient(0, #152238, #050933); 
  height: 100vh;
  display: grid;
  place-content: center;
  grid-column: 1 / -1;
  .card{
    min-width: 330px;
    border-radius: 0; box-shadow: 0 0 10px rgba($color: #000000, $alpha: 0.5);
    .card-header{font-size: 1.5rem;}
    .card-footer, .card-header{background: transparent; border: 0;}
    .card-footer{justify-content: space-between; display: flex;}
  }
}
</style>
