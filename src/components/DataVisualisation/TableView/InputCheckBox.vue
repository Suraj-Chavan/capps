<template>
    <input :checked="shouldBeChecked" @change="updateInput" type="checkbox" />
</template>

<script>
export default {
    name: "input-check-box",
    model: {
        prop: "modelValue",
        event: "change",
    },
    props: {
        modelValue: {
            default: false,
        },
        trueValue: {
            type: [String, Number, Boolean],
            default: true,
        },
        falseValue: {
            type: [String, Number, Boolean],
            default: false,
        },
    },
    computed: {
        shouldBeChecked() {
            return this.modelValue === this.trueValue;
        },
    },
    methods: {
        updateInput(event) {
            let isChecked = event.target.checked;
            this.$emit("change", isChecked ? this.trueValue : this.falseValue);
        }
    },
};
</script>
