<template>
    <div v-if="renderComp">
         <b-form inline>
              <label class="btn btn-info">{{item.filterLabel.toUpperCase() +" #"+ index}} </label>
              <div class="filter_option">
                    <v-select 
                        v-if="item.singleSelect"
                        v-model="selectedValues" 
                        :options="valuesOptions"
                        @input="setValuesOptions" 
                    >
                    </v-select>
                    <v-select 
                        v-else
                        v-model="selectedValues" 
                        :options="valuesOptions"
                        @input="setValuesOptions" 
                        multiple 
                    >
                    </v-select>
              </div>
                <b-button  variant="link pl-2 px-0" 
                        :id="`edit-button-${item.id}`" 
                        :style="'opacity:' + (designmode ? '1' : '0')"
                        :disabled="(designmode ? false : true)"
                        >
                    <b-icon-pencil />
                </b-button>     
         </b-form>


        <!-- Popover section      -->
            <b-popover
            :id="`popover ${item.id}`"
            :target="`edit-button-${item.id}`"
            triggers="focus click"
            placement="right"
            :container="`edit-button ${item.id}`"
            title="Set Filters"
            >
            <b-form>
                
                <b-form-group 
                :id="`date-input ${item.id}`" 
                label="Set Date Filter" 
                label-for="date-input"
                >
                    <b-form-radio-group 
                        size="sm" 
                        buttons button-variant="outline-dark" 
                        cols="12"
                        v-model="singleSelect"
                        @input="setSingleSelect" 
                        >
                        <b-form-radio :value=true>Single Select</b-form-radio>
                        <b-form-radio :value=false>Multi Select</b-form-radio>
                    </b-form-radio-group>
                </b-form-group>
                <b-form-group
                label="Choose DataSource"
                label-for="datasource-select"
                >
                <b-form-select :id="`datasource-select ${item.id}`"
                required
                v-model="filterDatasourceName"
                @change="setDataSource(item.id)"
                >
                    <b-form-select-option 
                        v-for="datasource in datasources" 
                        :key="datasource" 
                        :value="datasource"
                        >
                        {{datasource}}
                        </b-form-select-option>
                    </b-form-select>
                </b-form-group>
                <b-form-group
                    class="field-select"
                    label="Choose Fields"
                    label-for="filter_option"
                >
                    <div class="filter_option">
                        <v-select 
                                v-model="selected" 
                                :options="options" 
                                @input="setSelectedField(item.id)"
                            >
                            </v-select>
                    </div>
                </b-form-group>

                <b-form-group
                    label="Edit Filter Label"
                    label-for="filter-label"
                    description="Choose the collection to be filtered."
                >
                <b-input  type="text" 
                    placeholder="Change Filter's Label" 
                    required
                    v-model="filterLabel"
                    >
                </b-input>
                </b-form-group>
                    <!-- <hr /> -->
                <div class="d-flex justify-content-between">
                    <b-button  variant="outline-secondary"  size="sm" @click="removeFilter(item.id)">Remove Filter</b-button>
                    <b-button  variant="outline-danger" size="sm" @click="closePopover(`popover ${item.id}`)">Cancel</b-button>
                    <b-button  variant="info" size="sm" @click="setFiltersObject(item.id)">Apply</b-button>
                </div>
            </b-form>
            </b-popover>
      </div>
</template>

<script>
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
    name : "CategoryFilterComponent",
    props : {dataset : Object, datasources : Array, designmode :Boolean, item : Object, index :Number},
    components : {vSelect},
    data (){
        return{
            renderComp: true,
            filterDatasourceName : '',
            filterLabel : '',
            singleSelect : true,
            options: [],
            selected :[''],
            valuesOptions:[],
            selectedValues:[],
            filteredDataArr:[],
        
        };
    },
    methods  : {
        setSingleSelect()
        {
            this.item.singleSelect  = this.singleSelect;
        },
        setSelectedField()                        //THIS FUNCTION SETS THE SElECTED FIELDS IN LAYOUT
        {
            this.item.selectedField = this.selected;
        },
        setDataSource(id)                                      //gets all fields of selected data source on change
        {
            this.selected =[]
            this.$emit("onSetMetaData",{id : id, filterDatasourceName : this.filterDatasourceName});  
        },
        setFiltersObject(id)                  //THIS FUNCTION SETS THE DATASOURCE and gets fields back.
        {
          this.item.datasource = this.filterDatasourceName;
          this.item.filterLabel = this.filterLabel;
          this.$emit('onSetMetaData', {id : id, filterDatasourceName : this.filterDatasourceName});
          this.closePopover(`popover ${id}`)
        },
        setOuterSelectValues()
        {
            this.valuesOptions=[];
            let x = pluck(this.dataset.data, this.selected)
            x = x.filter((item, index) => x.indexOf(item) == index)
            this.valuesOptions = x;  
        }, 
        setValuesOptions()
        {
            this.item.selectedValues = this.selectedValues;
            this.$emit("onFetchFilteredData" ,{
                id: this.item.id,
                datasoure: this.item.datasource, 
                filterType: "Category",
                datasource : this.item.datasource,
                selectedField : this.item.selectedField,
                selectedValues : this.item.selectedValues
            })
        },
        filterProcessing()
        {
            if(this.item.singleSelect)
            {
                this.dataset.data.forEach((element) =>{
                    if (element[this.selected] == this.selectedValues)
                    {
                        this.filteredDataArr.push(element);
                    }
                }) 
            }
            else{
                this.dataset.data.forEach((element) =>{
                    this.selectedValues.map((val) => {
                        if(element[this.selected] == val) this.filteredDataArr.push(element)
                    })
                })
            }
            this.dataset.filteredData = this.filteredDataArr;
        },
        setFieldValues()                            //this function loads up values in options array for for select
        {
            this.options = [];
            var metadata = this.dataset["metadata"]
            Object.keys(metadata).forEach((key, index) =>{
                if(metadata[key].type == 'String' || metadata[key].type== 'Number' &&  key!= 'id')
                {
                this.options.push(key);
                }
            })
        }, 
        closePopover(popoverId)
        {
            this.$root.$emit('bv::hide::popover', popoverId)
        },
        removeFilter(filterId)
        {
            this.$emit('onRemoveFilter', filterId)
        },
        setOnLoad()
        {
            this.filterLabel = this.item.filterLabel;
            this.filterDatasourceName = this.item.datasource;
            this.singleSelect = this.item.singleSelect;
            this.selected = this.item.selectedField;
            this.selectedValues = this.item.selectedValues;
            this.setFiltersObject(this.item.id);
        }
    },
    mounted() {
            if(!this.item.datasource)
            {
                return 0;
            }
            else
            {
                this.setOnLoad();
            }
    },
    watch: {
      
          filtersArray(newVal, oldVal)
          {
            this.filtersArray = newVal;
          },
          dataset(newVal, oldVal)
          {
            this.dataset = newVal;
            this.setFieldValues();
            this.setOuterSelectValues();
            this.setValuesOptions();
            this.filterProcessing();
          }
         
    },
}
</script>

<style lang="scss" scoped>
    // .form-inline {
    //     .filter_option{width: 150px; min-width:100px}
    // }
    .popover-body{
        .field-select
        {
            .filter_option
            {
                width: 210px;
                min-width: 150px;
            }
        }
    }
</style>