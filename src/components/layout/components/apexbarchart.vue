<template>
  <div>
    <apexchart width="100%" height="auto" type="bar" :options="options" :series="series"></apexchart>
  </div>
</template>
<script>
import VueApexCharts from "vue-apexcharts";
const pluck = (valArray, property) => {
  var vals = [];
  for (var item of valArray) {
    vals.push(item[property]);
  }
  return vals;
};
export default {
  props: { dataset: Object, configuration: Object },
  components: { apexchart: VueApexCharts },
  data: function () {
    var conf = JSON.parse(JSON.stringify(this.configuration));
    conf = Object.assign(
      { layout: { title: "" }, x: "PRODUCT", y: "AMOUNT" },
      conf
    );

    return {
      conf : conf,  
      options: {
        chart: {
          id: "vuechart-example",
        },
        xaxis: {
          categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
        },
      },
      series: [
        {
          name: "series-1",
          data: [30, 40, 45, 50, 49, 60, 70, 91],
        },
      ],
    };
  },
  mounted() {},
  watch: {
    dataset(newVal, oldVal) {
      this.datasource = newVal;
      let x = pluck(this.datasource.data, this.conf.x);
      let y = pluck(this.datasource.data, this.conf.y);
      this.options = Object.assign(this.options, {xaxis:{categories : x}});
      this.series = [{data : y}];
    },
  },
};
</script>