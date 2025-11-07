<template>
    <b-dropdown :ref="`expandedView-f`" class="expandedView" right no-caret variant="link"> 
        <template #button-content variant="default">
            <b-icon-arrow-down-circle />
        </template>
            <div class="expandedView_header">
                <h4 class="text-capitalize">{{ title || "-" }}</h4>
                <button class="btn" @click="hideDropdown(`expandedView-f`)">
                    <b-icon-x />
                </button>
            </div>
            <div class="card-content grid--2 scroll-y">
                <div class="content" v-for="(i, k, itemIndex) in fields" :key="itemIndex">
                    <div class="hd">{{ i.label | capitalize }}</div>
                    <div class="cont text-truncate" :title="item[i.key]">
                        {{ item[i.key] || "-" }}
                    </div>
                </div>
            </div>
    </b-dropdown>
</template>
<script>
const randomId = () => `${Date.now()}-${Math.round(Math.random() * 100000000)}`;
export default {
    props:["title", "item", "fields"],
	methods: {
		hideDropdown(ref){
			this.$refs[ref].hide()
		}
	},
    computed:{
        index() {
            return randomId() + this.title
        }
    }
}
</script>