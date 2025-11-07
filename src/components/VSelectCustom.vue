<template>
<div>
    <v-select 
        v-if="item.multiple"
        v-model="innerValue"
        :label="item['ds-name'] || 'name'"
        :options="(item.dataset) ? item.dataset : []"
        placeholder="Select..."
        :reduce="a => a[item['ds-code']] ?  a[item['ds-code']] : a['code']"
        multiple
        >
    </v-select>
    <v-select 
        v-else
        v-model="innerValue"
        :label="item['ds-name'] || 'name'"
        :options="(item.dataset) ? item.dataset : []"
        placeholder="Select..."
        :reduce="a => a[item['ds-code']] ?  a[item['ds-code']] : a['code']"
        >
    </v-select>
</div>
</template>
<script>
export default {
    data: ()=>({
        innerValue: '',
    }),
    props: {
        item: {
            type: [Object, String],
            default: ""
        },
        value: {
            type: null
        }
    },
    watch: {
    innerValue(newVal) {
       this.$emit("input", newVal);
    },
    // Handles external model changes.
    value(newVal) {
      this.innerValue = newVal;
    }
  },
  created(){
      if (this.value) {
        this.innerValue = this.value;
        }
  }
}
</script>