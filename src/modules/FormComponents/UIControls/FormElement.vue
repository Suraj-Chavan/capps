<template>
    <formElementWithValidation 
        class="column" 
        :item="item" 
        :class="{ 'parent-check': ['checkbox', 'switch'].includes(item.fieldtype) }" 
        :locale="locale"
        :value="value[item.name]" 
        :dataset="item?.enums || []" 
        @input="updateFormData(item.name, $event)" 
        :custom-validation="customValidation"
        :style="{ width: item.width || '', height: item.height || ''}"
        :label-direction="labelDirection"
    />
</template>

<script>
export default {
    name: "form-element",
    props: {
        value: {
            type: Object,
            required: true,
        },
        item: {
            type: Object,
            required: true
        },
        locale: {
            type: Object,
            required: true,
        },
        customValidation: {
            type: Object,
        },
        labelDirection: {
            type: String,
            default: 'top-bottom'
        }
    },
    computed: {
        valueProxy: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit("input", value);
            }
        },
    },
    methods: {
        updateFormData(fieldName, value) {
            this.valueProxy = { ...this.value, [fieldName]: value };
        }
    }
}
</script>