<template>
  <div class="m-0 p-0">
    <div :id="ID" class="m-0 p-0" style="width:100%; height: 100%, margin-top:1vh; margin-left:1vh;"></div>
    <configuration-modal 
      :id="modalID"
      :valuesArray="valuesArray"
      :labelsArray="labelsArray"
      :conf="conf"
      @OnSetDataForChart="setDataForChart"
    >
    </configuration-modal>
  </div>
</template>
<script>
import Plotly from "Plotly";
import configurationModal from '../configurationModal';

const pluck = (valArray, property) => {
  var vals = [];
  for (var item of valArray) {
    vals.push(item[property]);
  }
  return vals;
};

export default {
  components:{configurationModal},
  props: { dataset: Object, configuration: Object, selectedDatasource: String},
  data() {
    var conf = JSON.parse(JSON.stringify(this.configuration));
    conf = Object.assign(
      { layout: { title: "" }, x: "PRODUCT", y: "AMOUNT" },
      conf
    );
    var ID = "funnelchart" + Date.now();
    var modalID = "Modal" + ID;
    return {
      conf: conf,
      datasource: {},
      ID: ID,
      modalID: modalID,
      chartDrawn : false,
      layout: {
        width: 350,
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
      chartconfig: { responsive: true, displayModeBar: false, editable: true },
      options: {},
      labelsArray: [],
      valuesArray: [],
      newDataSource : []
    };
  },
  mounted() {
    this.$root.$on("bv::modal::hidden", (bvEvent, modalID) => {
      this.drawChart();
    });
    if (!this.datasource || !this.datasource.data || !this.conf) return;
    this.drawChart();
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
      this.chartDrawn = true;
      if (!this.conf.x || !this.conf.y) return;
      if (!this.datasource.data) return;
      let x = pluck(this.datasource.data, this.conf.x);
      let y = pluck(this.datasource.data, this.conf.y);
      var charttrace = {
        type: "funnel",
        x: y,
        y: x,
        marker: {
          color: ['rgb(56, 75, 126)', 'rgb(18, 36, 37)', 'rgb(34, 53, 101)', 'rgb(36, 55, 57)', 'rgb(6, 4, 4)',
          'rgb(177, 127, 38)', 'rgb(205, 152, 36)', 'rgb(99, 79, 37)', 'rgb(129, 180, 179)', 'rgb(124, 103, 37)'],
          line: {
            width: 1,
          },
        },
      };

      Plotly.react(
        this.ID,
        [charttrace],
        Object.assign(this.layout, this.conf.layout),
        this.chartconfig
      );
    },
  },
  watch: {
    dataset(newVal, oldVal) {
      this.datasource = newVal;
      this.loadDataColumns();
      this.drawChart();
    },
  },
};
</script>

<style lang="scss">
.js-plotly-plot
{
  .plot-container
  {
      .svg-container
    {
      margin : 0 auto;
    }
  }
}
  

</style>
