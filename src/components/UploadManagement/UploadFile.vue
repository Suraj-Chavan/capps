<template>
  <div>
    <!-- MainContaint -->
    <div style="margin: 0% auto;border: 2px dashed; padding: 0" class="file-upload--dropzone">

      <!-- FileUploadContainer -->
      <FileUploadContainer type="single" :value="file" dropzone fileTypes=".csv" buttonTitle="Upload File (.csv)"
        @upload="upload" />

      <FileUploadList type="single" :files="file" @remove-single="file = []" />
      <!-- Progress bar -->
      <b-progress :value="uploadPercentage" style="height: 20px; width: 99%; margin: auto; margin-bottom: 2%;"
        variant="blue" show-progress animated v-show="showProgressBar"></b-progress>

    </div>
    <!-- AlertWrapper -->
    <div class="mb-0 mt-3 form-group d-flex justify-content-end border-0">
      <!-- ShortDate -->
      <div>
        <h4>
          <div class="btn-sm rounded-pill" style="border: 1px solid #6c757d;padding: 1px 5px">
            <div>
              <b class='text-muted'>
                <b-icon icon="exclamation-circle" fontScale="1.1" variant="dark">
                </b-icon> Expected short date format {{ globalDateFormatShort }}
              </b>
            </div>
          </div>
        </h4>

      </div>
    </div>
  </div>
</template>

<script>
import { NREST, globalDateFormatShort } from "config";
import {
  FileUploadContainer,
  FileUploadList,
} from "@credenceanalytics/components/file-upload";
import axios from 'axios';

export default {
  name: "UploadFile",

  props: {
    collection: {
      type: String,
    },
    uploadApi: {
      type: String,
      required: true
    }
  },

  data: () => ({
    file: [],
    uploadPercentage: 0,
    globalDateFormatShort,
    showProgressBar: false
  }),

  components: {
    FileUploadContainer,
    FileUploadList,
  },

  methods: {
    upload: function (e) {
      let files = e.target.files || e.dataTransfer.files;
      // type validation
      files = this.validateFileTypes(files, ".csv");
      this.file = [...this.file, ...files];
      if (this.file[0]) {

        setTimeout(() => this.uploadFile(this.file[0]), 0);
      }
    },
    uploadFile(file) {
      if (file == null) return this.$_errorMessage("Please select a csv file to upload");
      this.$store.commit("loading", true);
      const formData = new FormData();
      formData.append("FILE", file);
      let intervalId = null;

      const options = {
        method: "POST",
        body: formData,
        headers: { sessionid: sessionStorage.getItem("_ticket") },
        onUploadProgress: (progressEvent) => {
          this.uploadPercentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total

          );
          intervalId = setInterval(() => {
            // check if upload is complete
            if (this.uploadPercentage >= 100) {
              clearInterval(intervalId); // clear the interval
              this.showProgressBar = false;
            }
          }, 1000);
        }
      };

      this.showProgressBar = true;


      axios.post(`${NREST}${this.uploadApi}`, formData, options)
        .then((response) => {
          return response.data;
        })
        .then((response) => {
          this.$store.commit("loading", false);
          if (response && response.status == "unsuccess")
            return this.$_errorMessage(
              response.msg || response.error || `Error while processing`
            );
            this.$emit("hide-modal")
            setTimeout(() => 
            {
              this.$_successMessage(
                response.msg || response.error || `Action performed successfully`
              );
            }, 100);
        })
        .catch((err) => {
          this.$store.commit("loading", false);
          console.error(err);
        })
        .finally(() => {
          clearInterval(intervalId); // clear the interval
          this.showProgressBar = false;
        });
    },

    validateFileTypes(files, fileTypes) {
      return [...files].filter((file) => {
        const fileName = file.name;
        const extn = fileName
          .substring(fileName.lastIndexOf(".") + 1)
          .toLowerCase();
        if (fileTypes.indexOf(extn) === -1) {
          this.$_showAlert(
            "",
            '<b>File type is incorrect. Please Upload <i>".csv"</i> file</b>'
          );
        }
        return fileTypes.indexOf(extn) !== -1;
      });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .file-upload-container__field--dropzone {
  height: 18.1rem;
  width: 100%;
  padding: 0;
}

::v-deep .file-upload-list-item {
  margin: 5px;
}

::v-deep .file-upload-container__field__input {
  min-height: 22rem;
}
</style>