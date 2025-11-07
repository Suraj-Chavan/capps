<template>
  <b-modal
    centered
    title="Upload Management"
    size="xl"
    id="upload-management"
    @hide="goBack"
    no-close-on-esc
    no-close-on-backdrop
    hide-footer
    body-class="p-0"
  >
    <div class="upload-content">
      <section id="navdrawer">
        <div id="navdrawer-container">
          <div class="vue-navdrawer hidden-md-down">
            <ul class="nav flex-column slide-nav">
              <li class="nav-item">
                <a class="nav-link cursor-pointer" @click="setTab('upload-file')" :class="{active: activeTab === 'upload-file'}">
                  <b-icon icon="upload" font-scale="2" shift-v="2"></b-icon>
                </a>
                <p>Upload File&nbsp;&nbsp;&nbsp;<span class="sr-only">(Click to upload file)</span></p>
              </li>
              <!-- <li class="nav-item">
                <a class="nav-link" @click="setTab('download-file-format')" :class="{active: activeTab === 'download-file-format'}">
                  <b-icon icon="download" font-scale="2" shift-v="3"></b-icon>
                </a>
                <p>
                  Download File Format<span class="sr-only">(Click to download file format)</span>
                </p>
              </li> -->
              <li class="nav-item">
                <a class="nav-link cursor-pointer" @click="setTab('upload-history')" :class="{active: activeTab === 'upload-history'}">
                  <b-icon icon="clock" font-scale="2" shift-v="3"></b-icon>
                </a>
                <p>
                  Upload History<span class="sr-only">(Click to download file format)</span>
                </p>
              </li>
            </ul>
          </div>
          <div id="vue-navcontent">
            <div class="container-fluid">
              <component 
                :is="currentTabComponent" 
                @hide-modal="goBack"
                v-bind="$props"
              ></component>
            </div>
          </div>
        </div>
      </section>
    </div>
  </b-modal>
</template>

<script>
import UploadFile from '@/components/UploadManagement/UploadFile.vue';
import DownloadFileFormat from '@/components/UploadManagement/DownloadFileFormat.vue';
import UploadHistory from '@/components/UploadManagement/UploadHistory.vue';

export default {
  props: {
    collection: {
      type: String,
    },
    moduleName: {
      type: String,
      required: true,
    },
    tabname: {
      type: String,
    },
    uploadApi: {
      type: String,
      required: true
    },
    interfaceApi: {
      type: String,
      required: true
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
  data() {
    return {
      activeTab: this.tabname || 'upload-file', // Default tab
    };
  },
  computed: {
    currentTabComponent() {
      switch (this.activeTab) {
        case 'upload-file':
          return UploadFile;
        case 'download-file-format':
          return DownloadFileFormat;
        case 'upload-history':
          return UploadHistory;
        default:
          return UploadFile;
      }
    },
  },
  methods: {
    setTab(tab) {
      this.activeTab = tab;
    },
    goBack() {
      this.$nextTick(() => {
        const path = this.$route.path.split("/").slice(0, -1).join("/");
        this.$router.push({ path: path });
      });
    },
  },
  mounted() {
    setTimeout(() => {
      this.$bvModal.show("upload-management");
    }, 0);
  },
};
</script>

<style scoped lang="scss">

.cursor-pointer{
  cursor: pointer;
}
.upload-content {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  min-height: 25rem;

  #navdrawer-container {
    position: static;
    width: 100%;
    height: 100%;

    .vue-navdrawer {
      height: 100%;
      color: white;
      float: left;
      background: beige;
      width: 5%;

      .nav-item {
        padding-top: 5px 0;
        color: black;
      }

      .nav-item i {
        font-size: 1.2em;
      }
      .slide-nav {
        position: absolute;
        left: 0;
        bottom: 0;
        right: 0;
        top: 0;
        background-color: #d2d7e1;
        color: black;
        display: flex;
        width: fit-content;
        z-index: 3;

        

        .nav-item {
          & {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            height: 5em;
            overflow: hidden;
            padding: 10px 8px;
            transition: all 0.5s ease-in-out;
            p {
              display: none;
            }
            .nav-link, p  {
              opacity: 0.5;
              transition: width 0.5s ease-in;
            }
            .active {
              opacity: 1;
              color: #0016ff;
              & + p {
                opacity: 1;
              }
            }
          }
        }

        &:hover {
          width: 13em;
          p {
            display: inline-block;
            color: black;
            font-weight: 600;
            padding: 5px 10px;
            line-height: 15.5px;
          }
        }
      }
    }

    #vue-navcontent {
      width: calc(100% - 6%);
      height: 100%;
      float: right;
      padding: 0;
      margin: 0;

      .container-fluid {
        padding: 20px;
      }
    }
  }
}
</style>