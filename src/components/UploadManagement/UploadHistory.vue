<template>
  <div id="my-container">
    <div class="d-flex justify-content-end border-0">
      <b-pagination
        v-show="recordDetails.totalRecord"
        ref="pagination"
        size="md"
        pills
        align="right"
        v-model="currentPage"
        :per-page="perPage"
        :total-rows="recordDetails.totalRecord || localItems.length + 1"
        class="mb-0"
      ></b-pagination>
      <b-form-group class="mb-0 ml-4 mr-3" label-cols-lg="0">
        <b-button
          id="filter-popover"
          ref="button"
          size="md"
          variant="outline-primary"
        >
          <b-icon-funnel animation="throb" font-scale="1" />
        </b-button>
      </b-form-group>
    </div>

    <section class="card-table">
      <div class="card">
        <div class="card-body p-0">
          <b-table
            ref="modal-upload-table"
            :busy.sync="isBusy"
            :sort-by.sync="sortBy"
            :sort-desc="false"
            sort-icon-left
            striped
            hover
            sm
            borderless
            sticky-header
            head-variant="dark"
            responsive="sm"
            :items="getUploadData"
            :fields="fields"
            :per-page="perPage"
            :current-page="currentPage"
            class="mb-0 override-header-rule"
            :no-provider-sorting="true"
            :no-provider-filtering="true"
            show-empty
          >
            <template #cell()="{ value, index }">
              <div
                :id="'upload_history' + value + index"
                :class="{ 'adjust-width': ('' + value).length > 32 }"
              >
                {{ value }}
              </div>

              <b-tooltip
                :target="'upload_history' + value + index"
                :disabled="('' + value).length < 32"
              >
                <div
                  style="
                    text-align: initial;
                    min-height: fit-content;
                    max-height: 50vh;
                  "
                  class="scroll-y"
                >
                  <div v-html="value"></div>
                </div>
              </b-tooltip>
            </template>

            <template #cell(FILENAME)="data">
              {{ data.value }}
              <span class="ml-1 pointer" @click="getFileInterfaceData(data)">
                <b-icon-arrow-down-circle font-scale="1.2" />
              </span>
            </template>

            <template #cell(action)="data">
              <b-button variant="outline-info pb-1 pt-1" @click="showDetails(data.item.FILEID)">
                <b-icon icon="link" font-scale="1" shift-v="1"></b-icon> View Details
              </b-button>
              <view-details 
                v-if="showViewDetails" 
                :view_batch_number="viewBatchNumber" 
                @closeViewDetails="showViewDetails = false" 
                v-bind="$props"
              />
            </template>

            <template #table-busy>
              <div class="text-center text-danger my-2">
                <b-spinner class="align-middle"></b-spinner>
                <strong class="ml-2">Loading...</strong>
              </div>
            </template>

            <template #empty>
              <no-data>
                <template v-slot:msg>
                  <h5 class="text-muted">Sorry! no data found.</h5>
                </template>
              </no-data>
            </template>

          </b-table>
        </div>
      </div>
    </section>

    <b-popover
      target="filter-popover"
      triggers="click"
      :show.sync="popoverShow"
      placement="auto"
      container="my-container"
      ref="popover"
    >
      <template #title>
        Filter
        <span
          class="d-inline-block"
          style="float: right; cursor: pointer"
          @click="onClose"
        >
          <b-icon icon="x-circle" scale="1" variant="danger"></b-icon>
        </span>
      </template>

      <div class="filter-body scroll-y">
        <b-form-group
          v-for="(field, i) in fields.slice(1)"
          :ref="`input${i}`"
          :key="i"
          :label="field.label"
          :label-for="`popover-input-${i}`"
          label-cols="4"
          class="mb-2"
          :description="`Enter ${field.label}`"
        >
          <b-form-input
            focus
            :id="`popover-input-${i}`"
            v-model="filter[field.key]"
            size="sm"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          class="mb-0 mt-3 form-group d-flex justify-content-around border-0"
          label-cols-lg="0"
        >
          <b-button
            @click="onOk"
            size="sm"
            variant="outline-primary"
            class="m-1"
          >
            <b-icon-check animation="throb" font-scale="1.4" /> &nbsp;Apply
          </b-button>
          <b-button
            size="sm"
            variant="outline-warning"
            @click="reset"
            class="m-1"
          >
            <b-icon-arrow-counterclockwise
              animation="spin-reverse"
              font-scale="1.4"
            />&nbsp;Reset
          </b-button>
          <b-button
            @click="onClose"
            size="sm"
            variant="outline-danger"
            class="m-1"
          >
            <b-icon-x-circle animation="fade" font-scale="1.4" />&nbsp;Close
          </b-button>
        </b-form-group>
      </div>
    </b-popover>
  </div>
</template>

<script>
import ViewDetails from './view-details.vue';

export default {
  name: "upload-history",

  props: {
    collection: {
      type: String,
      required: true,
    },
    moduleName: {
      type: String,
      required: true,
    },
    interfaceApi: {
      type: String,
      required: true,
    },
    interfaceDownloadApi: {
      type: String,
      required: true
    },
    uploadViewDetailsRead: { 
      type: String,
      required: true
    }
  },

  components: {
    NoData: () => import("@/components/NoData.vue"),
    ViewDetails
  },

  data() {
    return {
      currentPage: 1,
      isBusy: false,
      sortBy: "ID",
      localItems: [],
      perPage: 7,

      fields: [
        { key: "action", label: "" },
        {
          key: "FILEID",
          label: "Batch Number",
          sortable: true,
          class: "adjust-width",
        },
        {
          key: "FILENAME",
          label: "File Name",
          sortable: true,
          class: "adjust-width",
        },
        {
          key: "FILETYPE",
          label: "File Type",
          sortable: true,
          class: "adjust-width",
        },
        {
          key: "MODULE_NAME",
          label: "Module Name",
          sortable: true,
          class: "adjust-width",
        },
        {
          key: "STATUS",
          label: "Status",
          sortable: true,
          class: "adjust-width",
        },
        {
          key: "REMARKS",
          label: "Remarks",
          sortable: true,
          class: "adjust-width",
        },
        {
          key: "UPLOADBY",
          label: "Uploaded By",
          sortable: true,
          class: "adjust-width",
        },
        {
          key: "UPLOADEDON",
          label: "Upload On",
          sortable: true,
          class: "adjust-width",
        },
      ],

      filter: {},
      popoverShow: false,
      viewBatchNumber: null,
      showViewDetails: false,
    };
  },
  computed: {
    recordDetails() {
      let lastRecord = (this.currentPage - 1) * this.perPage + this.perPage;
      let rc_interval = ((this.localItems || [])[0] || {}).RC_INTERNAL;
      lastRecord = lastRecord > rc_interval ? rc_interval : lastRecord;
      return {
        fisrtRecord: (this.currentPage - 1) * this.perPage + 1,
        lastRecord,
        totalRecord: rc_interval,
      };
    },
  },

  methods: {
    showDetails(batchNumber) {
      this.viewBatchNumber = batchNumber;
      this.showViewDetails = true;
    },
    onClose() {
      this.popoverShow = false;
    },
    onOk() {
      delete this.filter._filter;
      const keys = Object.keys(this.filter);
      if (keys.length) {
        this.onClose();
        this.filter._filter = keys.map((o) => ({
          field: o,
          asgn: "like",
          value: this.filter[o],
        }));
        this.refreshGrid();
      }
    },

    reset() {
      this.filter = {};
      this.refreshGrid();
    },

    refreshGrid() {
      this.localItems = [];
      this.currentPage = 1;
      this.$refs["modal-upload-table"].refresh();
    },

    getUploadData(ctx) {
      const _this = this;
      let start =
        (parseInt(ctx.currentPage) - 1) * parseInt(ctx.perPage) + 1 - 1;
      let filter = [
        { field: "MODULE_NAME", value: `${this.moduleName}.${this.collection}`, asgn: 'eq', type: 'STRING' },
      ];
      if (this.filter._filter) filter = [...filter, ...this.filter._filter];

      const vObj = {
        body: {
          filter,
          page: { start: "" + start, limit: "" + ctx.perPage },
          sort: { field: "FILEID", dir: "desc" },
        },
      };

      if (this.getUploadData.isLoading)
        return new Promise(function (resolve) {
          resolve(_this.localItems || []);
        });

      this.getUploadData.isLoading = true;
      this.isBusy = true;

      return this.$credCAPI
        .collection(this.interfaceApi)
        .read(vObj)
        .then((response) => {
          if (response && response.length) {
            _this.localItems = Object.freeze(response);
          } else throw new Error("No data");

          _this.getUploadData.isLoading = false;
          _this.isBusy = false;

          return new Promise(function (resolve) {
            resolve(_this.localItems);
          });
        })
        .catch(() => {
          _this.getUploadData.isLoading = false;
          _this.isBusy = false;

          return new Promise(function (resolve) {
            resolve([]);
          });
        });
    },

    getFileInterfaceData(obj) {
      const vm = this;
      const options = {
        body: {},
        headers: {
          Accept: "text/csv",
        },
      };
      vm.$_showNotificationSpinner("Downloading. Please Wait ...");
      vm.$credCAPI
        .collection(`${this.interfaceDownloadApi}/${obj.item.FILEID}`)
        .read(options)
        .then((result) => {
          if (result.status === "unsuccess")
            throw new Error((result || {}).error || result);
          var blob = new Blob([result]);
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = obj.item.FILENAME + ".csv";
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
};
</script>


<style scoped>
.override-header-rule {
  max-height: 100vh;
  min-height: 59vh;
}
.pointer {
  cursor: pointer;
}
.filter-body {
  height: 50vh;
  max-height: 80vh;
  overflow: hidden;
  overflow-y: revert;
  padding: 10px;
}
.adjust-width {
  max-width: 20em;
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>