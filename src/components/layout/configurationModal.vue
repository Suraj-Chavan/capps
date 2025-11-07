<template>
    <div>
      <b-modal :id="id" 
        hide-footer title="Set Configurations"
        header-bg-variant="blue"
        header-text-variant="light"    
    >
        <b-form>
        <b-form-group
          id="input-title"
          label="Title:"
          label-for="input-title"
          description="Title of the chart"
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
              <b-form-select v-model="conf.x">
                <b-form-select-option
                  v-for="(item,index) in labelsArray"
                  :key="index"
                  :value="item"
                >{{item}}</b-form-select-option>
              </b-form-select>
            </b-col>
            <b-col cols="6" md="6">
              <label>Values List</label>
              <b-form-select v-model="conf.y">
                <b-form-select-option
                  v-for="(item,index) in valuesArray"
                  :key="index"
                  :value="item"
                >{{item}}</b-form-select-option>
              </b-form-select>
            </b-col>
          </b-row>
        </b-form-group>
        <b-button class="mr-2" size="sm" variant="success" @click="setDataForChart">OK</b-button>
        <b-button size="sm" variant="danger" @click="$bvModal.hide(id)">Cancel</b-button>
      </b-form>
    </b-modal>
</div>
</template>

<script>
export default {
    props:{id : String, labelsArray : Array , valuesArray : Array , conf :Object},
    methods: {
        setDataForChart()
        {
            this.$emit("OnSetDataForChart")
        }
    },
}
</script>

<style lang="scss" scoped>

</style>