<template>
  <div>
    <div :id="elID"></div>
  </div>
</template>

<script>
import { Grid } from "gridjs";
import "gridjs/dist/theme/mermaid.css";

export default {
  data: () => {
    return {
      elID: "table" + Date.now()
    };
  },
  mounted() {
    const grid = new Grid({
      columns: ["Name", "Email", "Phone Number"],
      sort: true,
      search: true,
      data: [
        ["John", "john@example.com", "(353) 01 222 3333"],
        ["Mark", "mark@gmail.com", "(01) 22 888 4444"]
      ]
    });
    grid.render(document.getElementById(this.elID));
  }
};
</script>