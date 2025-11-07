

<script>
export default {
  name: "download-format",

  props: {
    collection: {
      type: String,
    },
  },

  methods: {
    download() {
      const vm = this;
      const options = {
        body: {},
        headers: {
          Accept: "text/csv",
        },
      };
      vm.$_showNotificationSpinner("Downloading CSV Preview. Please Wait ...");
      vm.$credCAPI
        .collection(
          `appbuilder/collectiondata/${vm.collection}/download/csvformat`
        )
        .read(options)
        .then((result) => {
          if (result.status === "unsuccess")
            throw new Error((result || {}).error || result);
          var blob = new Blob([result]);
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = vm.collection + "_sample_file.csv";
          vm.$_closeNotificationSpinner();
          a.click();
        })
        .catch((error) => {
          console.error(error);
          vm.$_errorMessage(
            error && (error.message || error.msg || error.error)
          );
          vm.$_closeNotificationSpinner();
        });
    },
  },

  render(h) {
    const DownIcon = h("b-icon", {
      props: {
        icon: "cloud-download",
        ariaHidden: true,
      },
    });
    const DownloadBtn = h(
      "b-button",
      {
        props: {
          block: true,
          variant: "primary",
        },

        directives: [
          {
            name: "b-tooltip",
            value: "Click here to download CSV format",
          },
        ],

        on: {
          click: function () {
            this.download();
          }.bind(this),
        },
      },

      [DownIcon, "  Click here to download CSV format"]
    );
    const EL = h("div", {}, [DownloadBtn]);
    const Container = h("div", { class: "container" }, [EL]);
    return h("div", { class: "wrapper" }, [Container]);
  },
};
</script>


<style scoped>
.wrapper {
  background: #d9f3ea;
  border: 1px solid #9c27b0;
  height: 250px;
  position: relative;
  width: 50%;
  margin: 0 auto;
}
.container {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
</style>