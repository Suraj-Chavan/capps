# Dashboard layout
Framework supports a drag and drop dashboard layout component. This is a vue component to provide users to design their own dashboard. This can be used in any view to provide customisable dashboard facility. 

To use the component the .vue file hsa ot be added to the module or view where it is needed. The component supports a slot where component template can be inserted.

Pls see example below.
```html
    <layout :dashboardID="dashboardID" :componentList="['linechart', 'barchart', 'scorecard', 'grid', 'comments']" :settings="settings" @onSave="save" v-slot="item">
      <div>
        <component :ref="item.item.i" v-bind:is="item.item.component" v-bind="item.item.configuration"></component>
      </div>
    </layout>

```
The script example is given below.
```js
import layout from "../../components/layout/layout";
import linechart from "./components/linechart";
import barchart from "./components/barchart";
import grid from "./components/grid";
import scorecard from "./components/scorecard";
import comments from "./components/comments";

import appDataStore from '../../utils/appdatastore'
var  dataStore = appDataStore('local')('dashboarddata');

export default {
  name: "Home",
  components: { layout: layout, linechart: linechart, barchart : barchart, scorecard : scorecard, comments: comments, grid : grid },
  data() {
    var settings = {};
    var that = this; 
    this.dashboardcollection = this.$credCAPI.collection('datastore')
    this.dashboardcollection.readone('dashboards')
    .then((data)=>{
        that.settings = data.data
    })
    return {
      dashboardID: 1,
      settings: settings,
      index: 0
    };
  },
  methods: {
    save(settingsData) {
      this.dashboardcollection.update({id: 'dashboards', data: settingsData})
    }
  }
};
```

The dashboard layout uses [vue-grid-layout component](https://github.com/jbaysolutions/vue-grid-layout). Please refer to the link for more information. 

## How to create dashboard component
A dashboard component is a single file vue component. The following are key requirements.
1. Component should have **configure** method which shows a configuration modal form to capture any user definable configurations.
2. It should also have a configuration prop. All configurations are provided as an object. The component has to manage deconstructing the object and handle the data to configure itself.  

Example of a simple comments component.
```js
<template>
  <div>
    <div class="about" style="text-overflow: ellipsis;">{{comments}}</div>
  </div>
</template>

<script>
export default {
  props: { configuration: Object },
  data ()  {
    return {comments : this.configuration.comments};;
  },
  methods: {
    configure() {
      let comment = window.prompt("Enter the comments", this.comments);
      if (comment) this.comments = comment;
      return {comments : this.comments};
    }
  }
};
</script>
```


### Adding a new component to dashboard.
Step: 1 => 
Create a Vue file of the component e.g "layout/components/barchart.vue"

Step: 2=>
Register component in parent component, that is layout.vue

Step: 3=>
Add Component's name in component list "frontoffice/dashboard/home.vue"

Step: 4=>
Add new component from applications dropdown list in browser and click save.

### Responsive components
In order to make the components responsive layout triggers a method **resize** in very component whenever user resizes the component. Dashbaord compoenents can implement a resize method to resize the component as required.  