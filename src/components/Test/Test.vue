<template>
    <div>
        This is a Vue 2 component

        <!-- <vue3-component-loader
            exposed-module="./DataTable"
            :component-props="componentProps"
            :component-events="vue3EventHandlers"
        ></vue3-component-loader> -->


        <vue3-component-loader
            exposed-module="./RecordSummaryDetails"
            :component-props="componentProps"
            :component-events="vue3EventHandlers"
        ></vue3-component-loader>
    </div>
</template>

<script>
export default {
    name: "test",
    props: {
        messageFromVue2: {
            type: String,
            // required: true
        }
    },
    components: {
        Vue3ComponentLoader: () => import("../Vue3ComponentLoader/Vue3ComponentLoader.vue")
    },
    computed: {
        componentProps() {
            return {
                // initialMessage: this.messageFromVue2
            }
        },
        vue3EventHandlers() {
            return {
                // Key is the event name as emitted by Vue 3 component (or as expected by its 'onEventName' prop)
                messageUpdated: this.handleVue3MessageUpdate,
                counterClicked: this.handleVue3CounterClick,
            }
        }
    },
    methods: {
        handleVue3MessageUpdate(payload) {
            console.log("Vue 2 Test.vue received messageUpdated from Vue 3:", payload);
        },
        handleVue3CounterClick(payload) {
            console.log("Vue 2 Test.vue received counterClicked from Vue 3:", payload);
        }
    }
}
</script>