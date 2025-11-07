<template>
  <div>
    <section class="top_bar">
      <b-navbar class="mainlevel" toggleable="lg">
        <b-navbar-brand>Dashboard</b-navbar-brand>

        <b-navbar-toggle target="nav-text-collapse">
          <template v-slot:default="{ expanded }">
            <b-icon v-if="expanded" icon="chevron-bar-up"></b-icon>
            <b-icon v-else icon="chevron-bar-down"></b-icon>
          </template>
        </b-navbar-toggle>

        <b-collapse id="nav-text-collapse" is-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-text>
             <v-select 
             class="dasboard_select" 
             :clearable="false" 
             v-model="dashboardID" 
             :options="Object.keys(settings)"
              @input="loadDashboard(dashboardID)"
             />
            </b-nav-text>
            <!-- <b-nav-text>
              <b-form-input
                list="my-list-id"
                variant="primary"
                v-model="dashboardID"
                @change="loadDashboard"
              ></b-form-input>
              <datalist id="my-list-id">
                <option v-for="(val,key, index) in dashboards" :key="index">{{key}}</option>
              </datalist>
            </b-nav-text> -->

            <b-nav-text>
              <b-button variant="link" v-b-popover.hover.bottomleft="'Refresh'" @click="refresh">
                <b-icon-bootstrap-reboot class="icon"></b-icon-bootstrap-reboot>
                <span class="d-inline-block d-lg-none">Refresh</span>
              </b-button>
            </b-nav-text>

            <b-nav-text>
              <b-button
                :pressed.sync="designmode"
                variant="link btn-default"
                v-b-popover.hover.bottomleft="'Design mode'+ (designmode ? ' on' : ' off')"
                :class="designmode ? 'active' : ''"
              >
                <b-icon
                  icon="bounding-box-circles"
                  class="icon"
                ></b-icon>
                <span class="d-inline-block d-lg-none">Design</span>
              </b-button>
            </b-nav-text>

           

            <b-nav-text>
               <b-dropdown
                id="filter-button"
                dropleft
                :disabled="designmode ? false : true"
                :variant="`link btn-default ${(designmode) ? 'active' : ''}`"
                v-b-popover.hover.bottomleft="'Add Filter'"
              >
                <template v-slot:button-content>
                  <b-icon-funnel class="icon"></b-icon-funnel>
                  <span class="d-inline-block d-lg-none">Add</span>
                </template>
                <!-- <b-dropdown-header >
                  <h5>Add Filter</h5>
                </b-dropdown-header> -->
                <b-dropdown-item
                  v-for="(item,index) in filtersDropdown"
                  :key="index"
                  variant="dark"
                  @click="addNewFilter(item)"
                >
                    <b-icon-plus-circle /> {{item.heading}}
                    <!-- <small>{{item.subheading}}</small> -->
                </b-dropdown-item>
              </b-dropdown>        
            </b-nav-text>
            <b-nav-text>
              <b-dropdown
                id="dropdown-1"
                dropleft
                :disabled="designmode ? false : true"
                :variant="`link btn-default ${(designmode) ? 'active' : ''}`"
                v-b-popover.hover.bottomleft="'Add component'"
              >
                <template v-slot:button-content>
                  <b-icon-columns class="icon"></b-icon-columns>
                  <span class="d-inline-block d-lg-none">Add</span>
                </template>
                <b-dropdown-item
                  v-for="compname in componentList"
                  :key="compname"
                  @click="addComponent(compname)"
                ><b-icon-plus-circle /> {{compname | capitalize}}</b-dropdown-item>
              </b-dropdown>
            </b-nav-text>

            <b-nav-text>
              <b-button :variant="`link btn-default ${(designmode) ? 'active' : ''}`" @click="save" v-b-popover.hover.bottomleft="'Save'">
                <b-icon-cloud-upload class="icon"></b-icon-cloud-upload>
                <span class="d-inline-block d-lg-none">Save</span>
              </b-button>
            </b-nav-text>

            <b-nav-text>
              <b-button
                variant="link  btn-default"
                v-b-popover.hover.bottomleft="'Delete'"
                @click="deleteDashboard"
              >
                <b-icon-bookmark-dash class="icon"></b-icon-bookmark-dash>
                <span class="d-inline-block d-lg-none">Delete</span>
              </b-button>
            </b-nav-text>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
     
      <b-navbar class="sublevel" toggleable="lg">
      <b-collapse id="nav-text-collapse" is-nav>
        <b-navbar-nav class="nav_filters">
          <b-nav-text 
          class="mr-lg-3"
          v-for="(item,index) in filtersArray"
          :key="index" 
          >
          <div v-if="item.filterType == 'Time And Date'">
              <date-filter-component
                :index="index"
                :item="item"
                :datasources= "datasources"
                :designmode="designmode"
                :dataset="datasets[item.id]"
                @onSetMetaData="setMetaDataFilters"
                @onRemoveFilter="removeFilter"
                @onFetchFilteredData="fetchFiltersData"
              >
              </date-filter-component> 
          </div>
          <div v-else>
              <category-filter-component
                :index="index"
                :item="item"
                :datasources= "datasources"
                :dataset="datasets[item.id]"
                :designmode="designmode"
                @onSetMetaData="setMetaDataFilters"
                @onFetchFilteredData="fetchFiltersData"
                @onRemoveFilter="removeFilter"
              >
              </category-filter-component>
          </div>
        </b-nav-text>   
        </b-navbar-nav>
      </b-collapse>   
      </b-navbar>

      <!-- ************Alert for Add new Component ************ -->
    <div class="add-alert pl-3 pr-3">
      <b-alert
        class="btn-info"
        dismissible
        fade
        :show="addNewComponentAlert"
        @dismissed="addNewComponentAlert=false"
      >
        <p class="text-light text-center"
            style="margin : 0 auto;"
        >
          New Component {{this.newCompInfo.toUpperCase()}} added successfully ! 
        </p>
      </b-alert>
    </div>

  </section>
    <div>
      <grid-layout
        :layout.sync="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="designmode"
        :is-resizable="designmode"
        :is-mirrored="false"
        :vertical-compact="false"
        :margin="[10, 10]"
        :use-css-transforms="true"
        :autoSize="true"
      >
        <grid-item
          v-for="(item) in layout"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :key="item.i"
          dragIgnoreFrom=".toolbar"
          @resized="resizedEvent"
        >
          <div class="card shadow border-0 h-100">
            <div class="custom-toggle-show ml-auto" 
                :style="'opacity:'+(designmode ? '1' : '0')"
                :disabled="(designmode ? false : true)"
            >
                <b-dropdown
                      id="dropdown-2"
                      dropleft
                      variant="link"
                      v-b-popover.hover.bottomleft="'Dataset'"
                      no-flip
                    >
                      <template v-slot:button-content>
                        <b-icon-card-list class="icon"></b-icon-card-list>
                      </template>
                      <b-dropdown-item
                        v-for="datasource in datasources"
                        :key="datasource"
                        @click="setData(item.i, datasource)"
                      >{{datasource}}</b-dropdown-item>
                    </b-dropdown>
                    <b-button variant="link" @click="configure(item.i);">
                      <b-icon-gear />
                    </b-button>
                    <b-button variant="link" @click="deleteComponent(item.i);">
                      <b-icon-archive />
                    </b-button>
              </div>
            <div class="card-body">
              <component
                :ref="item.i"
                v-bind:is="item.component"
                :configuration="item.configuration"
                :dataset="datasets[item.i]"
                :selectedDatasource="item.datasource"
                :filtersArray="filtersArray"
              >
              </component>
            </div>
          </div>
        </grid-item>
      </grid-layout>
    </div>
    <!-- **********Delete Individual Component Modal************  -->
    <div>
      <b-modal id="delete-modal" 
          size ="sm" 
          hide-footer title="Delete Component" 
          centered
          header-bg-variant="blue"
          header-text-variant="light"    
      >
            <div class="justify-content-start" 
                 style="font-size : 1.2rem; font-weight:bold;"
            >
              Do you really want to delete the component ?
            </div>
            <div class="d-flex justify-content-start mt-4">
                <b-button variant="success" class="mr-2" size="sm" @click="closeModal">Cancel</b-button>
                <b-button variant="outline-danger" size="sm" @click="removeComp">
                  <b-icon-file-earmark-break class="icon"></b-icon-file-earmark-break>
                  Delete
                </b-button>
            </div>
        </b-modal>
    </div>
  </div>
</template>

<script>
import VueGridLayout from "vue-grid-layout";
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

// const componentList = [
//   "linechart",
//   "barchart",
//   'piechart',
//   "scorecard",
//   "grid",
//   "comments",
//   "funnelchart",
//   "donutchart",
//   "heatmapchart"
// ];
import piechart from "./components/piechart";
import barchart from "./components/barchart";
import linechart from "./components/linechart";
import scorecard from "./components/scorecard";
import comments from "./components/comments";
import grid from "./components/grid";
import funnelchart from './components/funnelchart';
import donutchart from './components/donutchart';
import heatmapchart from './components/heatmapchart';
import DateFilterComponent from  './dateFilterComponent';
import CategoryFilterComponent from './categoryFilterComponent';

var defaultdashboard = [];

export default {
  name: "layout",
  props: {
    settings: Object,
    selected: String,
    datasources: Array,
    dataservice: Object,
    componentList: Array,
    filtersArray : Array,
  },
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    DateFilterComponent,
    CategoryFilterComponent,
    piechart,
    barchart,
    linechart,
    comments,
    scorecard,
    grid,
    funnelchart,
    donutchart,
    heatmapchart
  },
  data() {
    var settings = JSON.parse(JSON.stringify(this.settings));
    var list = Object.keys(settings);
    var dashboardID = this.selected || (list.length > 0 ? list[0] : "");

    return {
      dashboards: settings,
      dashboardID: dashboardID,
      layout: settings[dashboardID] || [],
      designmode: false,
      datasets: {},
      filtersDropdown : [
        {
          heading: "Time And Date",
          subheading : "Date range, relative date. "
        },
        {
          heading: "Category ",
          subheading : " Category Sub description."
        }
      ],
      removeCompName : '',
      addNewComponentAlert : false,
      newCompInfo : ''

    };
  },
  // created() {
  //   this.componentList = this.componentList;
  // },

  mounted() {
    // this.componentList = this.componentList;
    this.refresh();
  },
  watch: {
    settings(newVal, oldVal) {
      this.dashboards = JSON.parse(JSON.stringify(newVal));
      var list = Object.keys(newVal);
      this.dashboardID = this.selected || (list.length > 0 ? list[0] : "");
      this.layout = this.dashboards[this.dashboardID];
      this.refresh();
    },
  
  },
  methods: {
    loadDashboard(dashboardname) {
      if (!this.dashboards[dashboardname]) this.dashboards[dashboardname] = [];
      this.layout = this.dashboards[dashboardname];
      this.dashboardID = dashboardname;
      for (const datasetName in this.datasets) {
        if (this.datasets[datasetName]) delete this.datasets[datasetName];
      }
      this.refresh();
    },
    deleteDashboard() {
      if (
        window.confirm(`Do you really want to delete - ${this.dashboardID}?`)
      ) {
        delete this.dashboards[this.dashboardID];
        this.layout = [];
        this.dashboardID = "";
      }
    },
    addComponent(compname) {
      let item = {
        x: 0,
        y: 3,
        w: 4,
        h: 8,
        i: compname + Date.now(),
        component: compname,
        configuration: {},
        datasource: "",
      };
      this.layout.push(item);
      this.addNewComponentAlert = true;
      this.newCompInfo = compname;
    },
    closeModal()
    {
      this.$bvModal.hide("delete-modal");
    },
    removeComp()
    {
      let compname = this.removeCompName;
      let widgetid = this.layout.findIndex((el) => el.i == compname);
      if (widgetid > -1) this.layout.splice(widgetid, 1);
      this.closeModal();  
    },
    deleteComponent(compname) {
      this.removeCompName = compname;
      this.$bvModal.show("delete-modal");
    },
    resizedEvent(i, newX, newY, newHPx, newWPx) {
      var child = this.$refs[i];
      if (child && child[0].resize) {
        child[0].resize();
      }
    },
    setData(compname, datasource) {
  
        let widgetid = this.layout.findIndex((el) => el.i == compname);
        this.layout[widgetid].datasource = datasource;
        this.fetchData(compname, datasource);
    },
    fetchData(datasetName, collection) {
      const getMetaData = (adata) => {
        if (!adata || adata.length == 0) return null;
        let fields = Object.keys(adata[0]);
        var metadata = {};

        fields.forEach((field) => {
          let ctr = 0;
          let found = false;
          while (!found) {
            let aval = adata[ctr][field];
            if (!aval || aval == "") {
              ctr++;
              continue;
            }
            if (!isNaN(aval)) {
              metadata[field] = { type: "Number" };
              found = true;
              continue;
            }
            if (dayjs(aval, 'DD-MM-YYYY').format('DD-MM-YYYY') === aval){
              metadata[field] = { type: "Date" };
              found = true;
              continue;
            }
            metadata[field] = { type: "String" };
            found = true;
            continue;
          }
        });
        return metadata;
      };
      
      // let dataArr = this.filtersArray.filter((el) => el.datasource == collection && el.filterType == "Time And Date")[0];
      // if(dataArr != undefined && !datasetName.includes('datefilter'))
      // {
      //   this.dataservice
      //   .dataset(collection)
      //   .fetch()
      //   .then((data) => {
      //     let metadata = getMetaData(data.data);
      //     if (this.datasets[datasetName]) delete this.datasets[datasetName];
      //       var filteredData = this.datasets[dataArr.id].filteredData;
      //       this.$set(this.datasets, datasetName, {
      //         metadata: metadata,
      //         data: data.data,
      //         filterData : filteredData
      //       });
      //     });
      // }
      // else
      // {
      this.dataservice
        .dataset(collection)
        .fetch()
        .then((data) => {
          let metadata = getMetaData(data.data);
          if (this.datasets[datasetName]) delete this.datasets[datasetName];
          this.$set(this.datasets, datasetName, {
            metadata: metadata,
            data: data.data,
          });
        });
      // }
    },
    refresh() {
      let comps = this.layout;
      var that = this;
      comps.forEach((comp) => {
        if (comp.datasource) that.fetchData(comp.i, comp.datasource); 
      });

    },
    fetchFiltersData(filterObject)                //need to work on services
    {
			if(filterObject && Object.keys(filterObject).length == 0) return 0;
			this.$store.commit("loading", true);
			const vObj = {
				filter: {
					read_for: "dealing",
					dataobj: {
						...filterObject
					}
				}
      };
      this.$credCAPI
				.collection("liabilities/dealing/read")
				.read({body: vObj})
				.then(response => {
					if (response.hasOwnProperty("dataobj")) {
						this.dataSource = response.dataobj.data || [];
						this.fields = response.dataobj.fields || [];
					}
					this.$store.commit("loading", false);
				})
				.catch(error => console.error(error));
    },
    configure(refname) {
      var child = this.$refs[refname];
      var configuration = "";
      if (child && child[0].configure) {
        configuration = child[0].configure();
        let widgetid = this.layout.findIndex((el) => el.i == refname);
        this.layout[widgetid]["configuration"] = configuration;
      } else alert("Configure method not available");
    },
    save() {
      this.$store.commit("loading", true);
      this.dashboards[this.dashboardID] = this.layout;
      this.dashboards.filters  = this.filtersArray;
      this.$emit("onSave", this.dashboards);
   
       setTimeout(() => this.$store.commit("loading", false), 500);
    },
    addDataSet(selectedSource) {
      console.log(this.dashboards);
      this.$emit("onAddDataSet", selectedSource);
    },
     addNewFilter(filterName)
    {
      if(filterName.heading == "Time And Date")
      {
          this.filtersArray.push({
          id : "datefilter" +Date.now(), 
          filterType : filterName.heading, 
          filterLabel: filterName.heading,
          datasource : '',
          dateRange : {},
          fieldname : "",
          singleDatePicker : "",
          filteredData : ''
        });

      }
      else
      {
         this.filtersArray.push({
          id : "categoryfilter" +Date.now(), 
          filterType : filterName.heading, 
          filterLabel: filterName.heading,
          datasource : '',
          selectedField: '',
          selectedValues:'',
          singleSelect : "",
          filteredData : ''
        });
      }

    },
     setMetaDataFilters(receivedObject)
    {
      this.fetchData(receivedObject.id , receivedObject.filterDatasourceName);
    },

    removeFilter(filterId)
    {
      this.$emit("onRemoveFilter" , filterId);
    }
  },
};
</script>

<style lang="scss" scoped>
 .custom-show-toggle
 {
   display:inline;
   opacity: 0;
 }
 .custom-show-toggle:hover
 {
   opacity: 1;
   display: inline;
 }
 @media (max-width:767px) {
  .vue-grid-item {
    width: calc(100% - 2rem) !important;
    position: relative !important;
    height: auto !important;
    transform: none !important;
    margin: 1rem;
    box-sizing: content-box;
  }
}
 @media (min-width:768px) and (max-width:1024px) {
   .vue-grid-layout{display: grid; grid-template-columns: 1fr 1fr; grid-gap: 1rem; 
    padding: 1rem;}
  .vue-grid-item {
    width: 100% !important;
    position: relative !important;
    height: auto !important;
    transform: none !important;
  }
}
</style>
