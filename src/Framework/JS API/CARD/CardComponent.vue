<template>
	<div class="cred__capps-card" @click="setSelectedItem(!checkedItemStateLocal['SR_NO_' + doc.SR_NO], doc)">
		<component :is="collectionCardTemplate" :record="doc">
			<template v-slot:standard-actions>
				<component
                    :its-card-view="true"
					:is="Actions"
					:item="doc"
					:routePath="$route.path"
					:collection="collection"
					:referenceKey="referenceKey"
					:localeEl="localeEl"
					:showIcons="true"
					:showDots="showDots"
					:readApi="readApi"
					:customPayload="customPayload"
					:filter-setting="filterSetting"
					:moduleName="moduleName"
					@refresh:clicked="() => $emit('refresh:clicked')"
				></component>
			</template>
            <template #checkbox:container="{ doc }">
                <div class="checkbox_container" style="width: max-content;">
                    <span class="btn-group" >
                        <input-check-box
                            v-model="checkedItemStateLocal['SR_NO_' + doc.SR_NO]"
                            @change="(value) => setSelectedItem(value, doc)"
                        />
                    </span>
                </div>
            </template>
		</component>
	</div>
</template>

<script>
import { ActionMixin } from "@/mixins/action-mixin";
import { mapState, mapActions } from "vuex";
import InputCheckBox from '@/components/DataVisualisation/TableView/InputCheckBox.vue';

export default {
	name: "card-component",
	props: {
		doc: {
			type: Object,
			required: true,
		},
		collection: {
			type: String,
			required: true,
		},
		moduleName: {
			type: String,
			required: true,
		},
		collectionCardTemplate: {
			type: Function,
			required: true,
		},
		supportedActions: {
			type: Object,
		},
		referenceKey: {},
		localeEl: {},
		isCheckbox: {},
		isAction: {},
		readApi: {},
		moduleBasedActionCompPath: {},
		filterSetting: {},
		showDots: {},
	},
	mixins: [ActionMixin],
    components: { InputCheckBox },
    data() {
        return {
            checkedItemStateLocal: {}
        }
    },
    computed: {
        ...mapState("ChoseRecord", ["checkedItemState"]),
    },
    watch: {
        checkedItemState: {
			deep: true,
			handler(newVal, oldVal) {
				if(newVal && newVal != oldVal) {
					this.checkedItemStateLocal = Object.assign({}, new Function("return " + JSON.stringify({ ...newVal }))());
				}
			},
		},
    },
    methods: {
        ...mapActions("ChoseRecord", ["selectItem"]),
        setSelectedItem(checked, item) {
			this.selectItem({
				checked, 
				item,
				primaryKey: 'SR_NO_' + item.SR_NO,
			});
		},
    }
};
</script>

<style lang="scss" scoped>
.cred__capps-card {
    background: transparent;
}
</style>

