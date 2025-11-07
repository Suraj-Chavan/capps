<template>
	<ModalView size="md" title="Update Spread">
		<template v-slot:body>
			<!-- {{ vm }} -->

			<ValidationObserver ref="formObserver" v-slot="{ handleSubmit }" slim>
				<b-form autocomplete="off" @submit.prevent="handleSubmit(structureSubmit)">
					<div class="btn-hidden">
						<b-button id="submit_form" type="submit" variant="primary"
							>Submit</b-button
						>
					</div>
						<div class="grid grid--2">
							<FormElementWithValidation
								v-for="(item, index) in el.MainEl"
								:key="`MainEl${index}`"
								:item="item"
								v-model="vm[item.name]"
								:dataset="ds[item.ds]"
							>
							</FormElementWithValidation>
						</div>
				</b-form>
			</ValidationObserver>
		</template>

		<template v-slot:footer>
			<label for="submit_form" class="btn btn-primary">Update Spread</label>
		</template>
	</ModalView>
</template>

<script>
import { DataEntryMixin } from "@/mixins/data-entry-mixin";

export default {
	name: "UpdateSpreadForm",
	mixins: [DataEntryMixin],
	data: () => ({
		vm: {},
		el: getEl(),
		ds: {},
		ds_prefetched: {},
		scope: "create"
	}),
	created() {
	},
	methods: {
		structureSubmit() {
			this.scope == "create" ? this.onCreate() : this.onUpdate();
		},
		onCreate() {
			
		},
		onUpdate() {

		},
		createDataObj(vm) {
			
		}
	}
};

function getEl() {
	return {
		MainEl: [
			{
				type: "date",
				label: "Event Date",
				placeholder: "Enter Event Date",
				name: "EVENT_DATE",
				rules: "required"
			},
			{
				type: "text",
				label: "Spread",
				placeholder: "Enter Spread",
				name: "SPREAD",
				rules: "required"
			},
		]
	};
}
</script>
