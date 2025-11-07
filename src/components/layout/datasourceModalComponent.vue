<template>
    <b-modal id="data-source-modal" title="Configure DataSource Modal">
                  <form>
                    <b-form-group label="To add new Card, select a collcetion.">
                      <b-form-select v-model="selectedSource">
                        <b-form-select-option value="">Please Select Collection</b-form-select-option>
                          <b-form-select-option v-for="(item,index) in datasources" :value="item"
                          :key="index">{{item}}</b-form-select-option>
                      </b-form-select>
                      <b-button variant="primary" class="float-right mt-2" @click="addDataSet">
                        <b-icon icon="plus" class="icon"></b-icon> Add Dataset</b-button>
                    </b-form-group>
                  </form>
                  <b-card v-for="(item, index) in datasets" :key="index" :title="item.name">
                    <b-card-body>
                        <div>Data Source Name: <span>{{item.name}}</span></div>
                        <vue-query-builder :rules="item.rules" :query="query"></vue-query-builder>
                    </b-card-body>
                  </b-card>
        </b-modal>
        
</template>

<script>
import VueQueryBuilder from 'vue-query-builder';

export default {
    name : 'DataSourceModal',
    props: {datasources : Array, datasets: Array},
    components : {VueQueryBuilder},
    data() {
        return {
            selectedSource : null,
            query : {}
        }
    },
    methods : {
        addDataSet()
        {
            this.$emit("onAddDataSet", this.selectedSource);
        }
    }
}
</script>

<style scoped>

</style>