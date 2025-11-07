<template>
    <span>{{ label }}</span>
</template>

<script>
export default {
    name: "FormLabel",

    props: {
        item: {
            type: Object
        },
        locale: {
            type: Object
        }
    },

    computed: {
        label() {
            const item = this.item;
            const locale = this.locale;

            return (
                item.hide_label != true &&
                item.type != "hidden" &&
                item["type"] != "checkbox" &&
                item["type"] != "radio"
            ) ? (
                locale &&
                    locale.hasOwnProperty(item["name"]) ?
                    locale[item["name"]] :
                    (item["label"] || item["name"].replace(/_/g, " ") )
            ) || item["label"]
            : ""
        }
    },

    methods: {
        
    }
}
</script>