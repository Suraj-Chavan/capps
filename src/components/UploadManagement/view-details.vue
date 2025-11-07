<template>
  <b-modal
    centered
    title="View Upload Data"
    size="lg"
    id="view-management"
    @hide="goBack"
    hide-footer
    body-class="p-1"
  >
    <div class="upload-content" id="my-container2">
      <div class="d-flex justify-content-end border-0 align-items-center">
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
        <b-form-group
          class="mb-0 ml-3 mr-3"
          label-cols-lg="0"
          v-show="fields.length"
        >
          <b-button
            size="md"
            variant="outline-primary"
            class="ml-1 mr-1"
            @click="downloadCSV"
            v-show="localItems.length"
          >
            <b-icon-download animation="cylon-vertical" font-scale="1" />
          </b-button>
          <b-button
            id="popover-reactive-2"
            ref="button"
            size="md"
            variant="outline-primary"
            class="ml-1 mr-0"
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
                  :id="'view_details' + value + index"
                  :class="{ 'adjust-width': ('' + value).length > 32 }"
                >
                  {{ value }}
                </div>

                <b-tooltip
                  :target="'view_details' + value + index"
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

              <template #empty>
                <no-data>
                  <!-- <template v-slot:msg>
                    <span></span>
                  </template> -->
                </no-data>
              </template>

              <template #table-busy>
                <div class="text-center text-danger my-2">
                  <b-spinner class="align-middle"></b-spinner>
                  <strong class="ml-2">Loading...</strong>
                </div>
              </template>
            </b-table>
          </div>
        </div>
      </section>

      <b-popover
        target="popover-reactive-2"
        triggers="click"
        :show.sync="popoverShow"
        placement="auto"
        container="my-container2"
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
            v-for="(field, i) in fields"
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
              <b-icon-check animation="throb" font-scale="1.4" />
              &nbsp;Apply
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
  </b-modal>
</template>

<script>
const convertUnderScoreToSpace = (str) => {
  return str
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^(.)/, function ($1) {
      return $1.toUpperCase();
    });
};
import {
  isPlainObject,
  isPlainArray,
  hasOwn,
} from "@credenceanalytics/utilities";

const STANDARD_FIEDS = {
  SYS_STATUS: "Status",
  SYS_REMARKS: "Remarks",
  SYS_BATCH_NO: "Batch Number",
};
const IGNORE_FIELDS = ["RC_INTERNAL", "SR_NO", "SYS_BATCH_NO"];
const fields = {};

export default {
  name: "ViewDetails",

  components: {
    NoData: () =>
      import("@/components/NoData.vue"),
  },

  props: {
    view_batch_number: {
      type: [String, Number],
    },
    collection: {
      type: String,
    },
    uploadViewDetailsRead: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      currentPage: 1,
      isBusy: false,
      sortBy: "ID",
      localItems: [],
      perPage: 10,

      fields: [],
      filter: {},
      popoverShow: false,
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
    downloadCSV() {
      let filter = [{ field: "SYS_BATCH_NO", value: this.view_batch_number }];
      if (this.filter._filter) filter = [...filter, ...this.filter._filter];
      const vObj = {
        body: {
          filter,
          redirect: "follow",
        },
        headers: {
          Accept: "text/csv",
        },
      };

      const vm = this;
      vm.$_showNotificationSpinner("Downloading. Please Wait ...");

      this.$credCAPI
        .collection(this.uploadViewDetailsRead)
        .read(vObj)
        .then((result) => {
          if (result.status === "unsuccess")
            throw new Error((result || {}).error || result);
          var blob = new Blob([result]);
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = this.$route.query.collection + ".csv";
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

    goBack() {
      this.$emit("closeViewDetails");
    },

    getFieldData(fields, conf) {
      const IGNORE_FIELDS =
        (isPlainObject(conf) &&
          isPlainArray(conf.ignore_fields) &&
          conf.ignore_fields) ||
        [];
      const STANDARD_FIEDS =
        (isPlainObject(conf) &&
          isPlainObject(conf.standard_fieds) &&
          conf.standard_fieds) ||
        {};
      const _f = [];
      fields.sort().forEach((element) => {
        if (IGNORE_FIELDS.includes(element)) return;
        _f.push({
          key: element,
          label: hasOwn(STANDARD_FIEDS, element)
            ? STANDARD_FIEDS[element]
            : convertUnderScoreToSpace(element),
          sortable: true,
          class: "adjust-width",
        });
      });

      return _f;
    },

    getUploadData(ctx) {
      const _this = this;
      let start =
        (parseInt(ctx.currentPage) - 1) * parseInt(ctx.perPage) + 1 - 1;
      let filter = [{ field: "sys_batch_no", value: _this.view_batch_number }];
      if (this.filter._filter) filter = [...filter, ...this.filter._filter];

      const vObj = {
        body: {
          filter,
          page: { start: "" + start, limit: "" + ctx.perPage },
        },
      };

      if (this.getUploadData.isLoading)
        return new Promise(function (resolve) {
          resolve(_this.localItems || []);
        });

      this.getUploadData.isLoading = true;
      this.isBusy = true;

      return this.$credCAPI
        .collection(this.uploadViewDetailsRead)
        .read(vObj)
        .then((response) => {
          if (response && response.length) {
            _this.localItems = Object.freeze(response);
          } else throw new Error("No data");

          if (fields[_this.collection] == null) {
            fields[_this.collection] = _this.getFieldData(
              Object.keys(response[0]),
              {
                ignore_fields: IGNORE_FIELDS,
                standard_fieds: STANDARD_FIEDS,
              }
            );
          }

          _this.fields = fields[_this.collection];

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
  },

  mounted() {
    setTimeout(() => {
      this.$bvModal.show("view-management");
    }, 0);
  },
};
</script>

<style scoped lang="scss">
.upload-content {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  min-height: 25rem;
}
.filter-body {
  max-height: 50vh;
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
.override-header-rule {
  max-height: 100vh;
  min-height: 59vh;
}
</style>