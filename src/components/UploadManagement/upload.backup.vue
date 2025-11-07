<script>
import { FileUpload } from "@credenceanalytics/components/file-upload";

export default {
  props: {
    collection: {
      type: String,
    },
  },

  data: () => ({
    file: [],
  }),

  render(h) {
    const vm = this;

    const SLOT_CUSTOM_ACTIONS = h(
      "b-button",
      {
        style: {
          position: "absolute",
          top: "50px",
          right: "40px",
        },

        directives: [
          {
            name: "b-tooltip",
            value: "Download Format",
          },
        ],

        on: {
          click: function () {
            const options = {
              body: {},
              headers: {
                Accept: "text/csv",
              },
            };

            vm.showNotificationSpinner("Downloading CSV Preview. Please Wait ...");
            vm.$credCAPI
              .collection(`appbuilder/collectiondata/${vm.collection}/download/csvformat`)
              .read(options)
              .then((result) => {
                if (result.status === "unsuccess")
                  throw new Error((result || {}).error || result);
                var blob = new Blob([result]);
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = url;
                a.download = vm.collection + "_sample_file.csv";
                vm.closeNotificationSpinner();
                a.click();
              })
              .catch((error) => {
                console.error(error);
                vm.$_errorMessage(error && (error.message || error.msg || error.error));
                vm.closeNotificationSpinner();
              });
          },
        },
      },

      [
        h("b-icon", {
          props: {
            icon: "cloud-download",
            ariaHidden: true,
          },
        }),
      ]
    );

    const UploadFileButtonComponent = h(
      FileUpload,
      {
        props: {
          type: "single",
          value: vm.file,
          dropzone: true,
          fileTypes: ".csv",
          buttonTitle: "Upload CSV File",
        },
        on: {
          input: function (value) {
            vm.file = value;
            vm.$emit("input", value[0]);
          },
        },
      },
      [SLOT_CUSTOM_ACTIONS]
    );

    return h("div", { class: ["file-upload"] }, [UploadFileButtonComponent]);
  },
};
</script>