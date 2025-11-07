<template>
    <div v-if="renderComp" >
          <b-form inline>
              <label class="btn btn-info">{{item.filterLabel.toUpperCase() +" #"+ index}} </label>
              <div class="date-option">
                <div class="filter_option wide">
							    <date-picker
                    :range="!item.singleDatePicker"
                    type="date"
                    v-model="currentValue"
                    input-class="form-control"
                    :format="$globalDateFormatShort"
                    :value-type="$globalDateFormatShort"
                    :editable=false
                    :clearable=true
                    :value="currentValue"
                    placeholder="Select Date"
                    @input="setDateRange(item.id)"
                  >
							    </date-picker>
							  </div>
                <!-- <date-range-picker
                :ref="`picker ${item.id}`"
                opens="center"
                :singleDatePicker="item.singleDatePicker"
                :autoApply="true"
                :showDropdowns="true"
                v-model="dateRange"
                :locale-data="localeData"
                @update="setDateRange(item.id)"
              /> -->
              </div> 
              <b-button   variant="link pl-2 px-0"
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
          triggers="focus"
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
                v-model="singleDatePicker"
                @input="setSingleDatePicker" 
              >
                <b-form-radio  :value=true>Single Date</b-form-radio>
                <b-form-radio :value=false>Date Range</b-form-radio>
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
              label="CHOOSE FIELD TO BE FILTERED"
              :label-for="`date-field-filter ${item.id}`"
            >
              <b-form-select
                :id="`date-field-filter ${item.id}`"
                required 
                v-model="dateFieldToFilter"
              >
                  <b-form-select-option
                    v-for="(item, index) in optionsArray"
                    :key="index"
                    :value="item"
                  >
                      {{item}}
                  </b-form-select-option>
              </b-form-select>
            </b-form-group>
            <b-form-group
                label="Edit Filter Label"
                label-for="filter-label"
            >
               <b-input  type="text" 
                placeholder="Change Filter's Label" 
                required
                v-model="filterLabel"
                >
            </b-input>
            </b-form-group>
            <div class="d-flex justify-content-between">
              <b-button  variant="outline-secondary"  size="sm" @click="removeFilter(item.id)">Remove Filter</b-button>
              <b-button  variant="outline-danger" size="sm" @click="closePopover(`popover ${item.id}`)">Cancel</b-button>
              <b-button  variant="info" size="sm"  @click="setFiltersObject(item.id)">Apply</b-button>
            </div>
          </b-form>
        </b-popover>
      </div>
</template>

<script>
import DateRangePicker from 'vue2-daterange-picker';
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css';
import dayjs from 'dayjs';

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat);

var isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween);

export default {
    name : 'DateFilterComponent',
    components : {DateRangePicker},
    props : {dataset : Object, datasources : Array, designmode :Boolean, item : Object, index: Number},
    data (){
        return{
          renderComp: true,
          dateFieldToFilter:'',
          filterDatasourceName : '',
          filterLabel:'',
          singleDatePicker : false,
          dateRange : {
              startDate : "",
              endDate : ""
          },
          currentValue: [],   
          localeData:{
            direction: 'ltr',
            format: 'mm/dd/yyyy',
            separator: ' - ',
            applyLabel: 'Apply',
            cancelLabel: 'Cancel',
            weekLabel: 'W',
            customRangeLabel: 'Custom Range',
            daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            firstDay: 0
          },
          optionsArray :[],
          filteredDataArr : []
        };
    },
    methods  : {
        setSingleDatePicker()
        {
          this.item.singleDatePicker  = this.singleDatePicker;
        },
        setDataSource(id)                                      //gets all fields of selected data source on change
        {
          this.$emit("onSetMetaData",{id : id, filterDatasourceName : this.filterDatasourceName});  
        },
        setFiltersObject(id)                   //sets datasource name and field to be filtered in layout on submit
        {
          this.item.datasource = this.filterDatasourceName;
          this.item.fieldname = this.dateFieldToFilter;
          this.item.filterLabel = this.filterLabel;
          this.closePopover(`popover ${id}`);
        },  
        setFieldValues()                                  //sets fields into for select when datasource is selected
        {
          this.optionsArray = [];
          var metadata = this.dataset["metadata"]
          Object.keys(metadata).forEach((key, index) =>{
            if(metadata[key].type == 'Date')
            {
              this.optionsArray.push(key);
            }
          })
        },
        setDateRange()
        {
          this.item.dateRange = this.currentValue
          this.filtersDataProcessing();
          this.$emit("onFetchFilteredData" , {
            id: this.item.id, 
            datasoure: this.item.datasource, 
            filterType: "Time And Date",
            fieldname:this.item.fieldname,
            dateRange : this.item.dateRange
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
          this.dateRange = this.item.dateRange;
          this.currentValue = [];
          this.currentValue = this.item.dateRange
          this.dateFieldToFilter = this.item.fieldname;
          this.filterDatasourceName = this.item.datasource;
          this.filterLabel = this.item.filterLabel;
          this.setDataSource(this.item.id);
        },
        filtersDataProcessing()
        {
          var customDate;
          var startDate = dayjs(this.currentValue[0], "DD-MM-YYYY").format();
          var endDate = dayjs(this.currentValue[1], "DD-MM-YYYY").format();
          this.filteredDataArr = [];

          if(this.item.singleDatePicker)
          {
            var startDate = dayjs(this.currentValue, "DD-MM-YYYY").format();
            this.dataset.data.forEach((element) =>{
              customDate = dayjs(element[this.dateFieldToFilter], "DD-MM-YYYY").format();
             if(dayjs(customDate).isSame(startDate))
            {
              this.filteredDataArr.push(element);
            }
            })
          }
          else{
            this.dataset.data.forEach((element) =>{ 
            customDate = dayjs(element[this.dateFieldToFilter], "DD-MM-YYYY").format();
             if(dayjs(customDate).isBetween(startDate,endDate,null, '[]'))
            {
              this.filteredDataArr.push(element);
            }
          })
        }
        this.dataset.filteredData = this.filteredDataArr;
        // console.log(`Date filter filtered data ` , this.dataset.filteredData);   
      },
    },
      mounted() {
        if(!this.item.datasource || !this.item.dateRange || !this.item.fieldname)
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
            // deep : true
          },
          dataset(newVal, oldVal)
          {
            this.setFieldValues();
            this.filtersDataProcessing();
            this.setDateRange();
          }
         
    },
}
</script>

<style lang="scss"scoped>

// .form-inline{
//   .date-option{
//     // width : 200px;
//     // min-width: 150px;;
//     .vue-daterange-picker
//     {
//       width: 190px;
//     }
// }
// }
  
</style>