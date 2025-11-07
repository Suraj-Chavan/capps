<template>
<div>
  <div :id="ID">
    <!-- <div class="scorecard">
      <div class="cardrow1">
        <div class="caption">Billings</div>
      </div>
      <div class="cardrow2">
        <div class="prefix">Rs.</div>
        <div class="score">200</div>
        <div class="suffix">Lakhs</div>
      </div>
    </div> -->

  </div>
  <b-modal :id="modalID" hide-footer title="Set Configurations">
      <h3>This is the config modal of score card component.</h3>
    </b-modal>
</div>
</template>

<script>
import Plotly from "Plotly";

export default {
  props : {configuration : Object},
  data ()
  {
  var ID = "barchart" + Date.now();
  var modalID = "Modal" + ID
    return {
     
      ID: ID,
      modalID : modalID,
      data :[
        {
          type: "indicator",
          mode: "number",
          value: 200,
          number: { prefix: "$" },
          title : { text : "Billings"},
          domain: { x: [0, 1], y: [0, 1] }
        }
      ],
      layout :{
        paper_bgcolor: "white",
        width: 100,
        height: 100,
        margin: { t: 0, b: 0, l: 0, r: 0 }
      },
      config : {responsive: true, editable : false}
    };
  },
  methods: {
    drawChart() {
      var ctx = document.getElementById(this.ID);
      var charttrace = {
        type: "indicator",
        value: 200,
        marker: {
          color: "acqua",
          line: {
            width: 2.5,
          },
        },
      };

      Plotly.newPlot(this.ID , this.data, this.layout);
    },
    configure()
    {
       this.$bvModal.show(this.modalID);
       return this.configuration;
    }
  },
  mounted() {
    this.drawChart();
      // Plotly.newPlot(this.ID , this.data, this.layout, this.config);

  },
}
</script>

<style >
.scorecard {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 20px auto;
  height: 100%;
  align-items: stretch;
  justify-content: flex-end;
}

.cardrow1 {
  display: flex;
  justify-content: flex-start;
  grid-column-start: auto;
  grid-column-end: auto;
  grid-row-start: 1;
  grid-row-end: 1;
}
.cardrow2 {
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  grid-column-start: auto;
  grid-column-end: auto;
  grid-row-start: 2;
  grid-row-end: 2;
}

.cardrow1 > .caption {
  font-size: 20px;
  margin: 5px;
  flex: none;
  text-align: left;
}

.cardrow2 > .score {
  font-size: 40px;
  order: 3;
  align-self: flex-end;
  flex: none;
  text-align: right;
  margin: 5px;
}

.cardrow2 > .prefix {
  font-size: 10px;
  order: 2;
  flex: 0 1 5%;
  align-self: flex-end;
  text-align: right;
  margin: 5px;
}
.cardrow2 > .suffix {
  font-size: 10px;
  order: 4;
  flex: 0 1 5%;
  align-self: flex-end;
  margin: 5px;
}
</style>


