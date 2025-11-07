<template>
    <div>
      <div  :id="ID" class="m-0 p-0" style="width:100%; height: 100%, margin-top:1vh; margin-left:1vh"></div>
      <b-modal 
      :id="modalID" 
      hide-footer 
      title="Set Configurations"
      header-bg-variant="blue"
      header-text-variant="light" 
    >
          <b-form>
            <b-form-group
              id="input-title"
              label="Title:"
              label-for="input-title"
              description="Title of the chart "
            >
              <b-form-input
                id="input-title"
                v-model="conf.layout.title"
                type="text"
                required
                placeholder="Title"
              ></b-form-input>
            </b-form-group>
            <b-form-group class="x-value" label="Choose Column and Values">
              <b-row>
                <b-col cols="6" md="6">
                  <label>Columns List</label>
                  <v-select v-model="conf.x"
                    :options="labelsArray"
                    >
                  </v-select>
                </b-col>
                <b-col cols="6" md="6">
                  <label>Values List</label>
                  <v-select v-model="conf.y"  
                      :options="valuesArray"
                      multiple
                      >
                  </v-select>
                </b-col>
              </b-row>
            </b-form-group>
            <b-button class="mr-2" size="sm" variant="success" @click="setDataForChart">OK</b-button>
            <b-button size="sm" variant="danger" @click="$bvModal.hide(modalID)">Cancel</b-button>
          </b-form>
    </b-modal>
  </div>
</template>

<script>
import Plotly from 'Plotly';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

const pluck = (valArray, property) => {
  var vals = [];
  for (var item of valArray) {
    vals.push(item[property]);
  }
  return vals;
};
export default {
    props: { dataset: Object, configuration: Object, selectedDatasource: String, filtersArray : Array},
    components : {vSelect},
    data()
    {
        var conf = JSON.parse(JSON.stringify(this.configuration));
        conf = Object.assign(
        { layout: { title: "" }, x: "PRODUCT", y: "AMOUNT" },
        conf
        );

        var ID = "heatmapchart" + Date.now();
        var modalID = ID + Date.now();
        return{
        ID :ID,
        modalID : modalID,
        conf : conf,
        datasource: {},
        layout: {
          width: 450,
          height: 400,
          title: {
            text: "Sample text",
            font: {
              family: "Courier New, monospace",
              size: 18,
            },
          },
          margin: {
            l: 25,
            r: 25,
            b: 40,
            t: 25,
            pad: 2,
          },
          paper_bgcolor: "#ffffff00",
          plot_bgcolor: "#ffffff00",
          autosize: false,
          autoexpand: true,
          showlegend: false,
          xaxis: {
            autorange: true,
            automargin: true,
            tickangle : -90,
            tickfont : {
              size : 12,
            }
          },
          yaxis: {
            autorange: true,
            automargin: true,
          },
      },
      chartconfig: { responsive: true, displayModeBar: false, editable: false },
      labelsArray: [],
      valuesArray: [],

        }
    },
    methods: {
        loadDataColumns() {
      this.labelsArray = [];
      this.valuesArray = [];
      Object.keys(this.datasource.metadata).forEach((key, index) => {
        if (this.datasource.metadata[key].type === "String") {
          this.labelsArray.push(key);
        } else if (
          key != "id" &&
          this.datasource.metadata[key].type === "Number"
        ) {
          this.valuesArray.push(key);
        }
      });
    },
    setDataForChart() {
      this.$bvModal.hide(this.modalID);
      this.drawChart();
    },
    configure() {
      this.$bvModal.show(this.modalID);
      return this.conf;
    },
    resize() {
      if (!this.chartDrawn) return;
      Plotly.relayout(this.ID, {
        width: this.$el.offsetWidth * 0.95,
        height: this.$el.offsetHeight * 0.95,
      });
    },
    drawChart() {
      var ctx = document.getElementById(this.ID);
      if (!this.conf.x || !this.conf.y) return;
      if (!this.datasource.data) return;
      let x = pluck(this.datasource.data, this.conf.x);
      let y = this.conf.y;
      let z =[[]];
      y.forEach((item, index) =>{
        z[index] = pluck(this.datasource.data , item);
      })
    
      
      var charttrace = {
        type: "heatmap",
        x: x,
        y: y,
        z :z,
        hoverongaps: false,
        colorscale: 'Portland',
      };

      Plotly.react(
        this.ID,
        [charttrace],
        Object.assign(this.layout, this.conf.layout),
        this.chartconfig
      ).then(() => this.chartDrawn = true)
    },
    },
    mounted() {
        this.$root.$on("bv::modal::hidden", (bvEvent, modalID) => {
          this.drawChart();
      });
        if (!this.datasource || !this.datasource.data || !this.conf) return;
          this.drawChart();
    },
    watch: {
    dataset(newVal, oldVal) {
      this.datasource = newVal;
      this.loadDataColumns();
      this.setDataForChart();
    },
  },
}
</script>

<style>
    
</style>