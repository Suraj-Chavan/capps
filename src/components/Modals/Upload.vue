<template>
	<ModalView size="md" title="Upload">
		<template v-slot:body>
			<!-- {{ vm }} -->

			<ValidationObserver ref="formObserver" v-slot="{ handleSubmit }" slim>
				<b-form autocomplete="off" @submit.prevent="handleSubmit(structureSubmit)">
					<div class="btn-hidden">
						<b-button id="submit_form" type="submit" variant="primary"
							>Submit</b-button
						>
					</div>
						<div class="grid grid--1">
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
			<label for="submit_form" class="btn btn-primary">Upload</label>
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
		ds: {},
		ds_prefetched: {},
		scope: "create"
	}),
	computed: {
		el(){
			return getEl(this)
		},
	},
	methods: {
		structureSubmit() {
			const vObj = {
				filter:{
					"data": {
						"upload_id": "registry.position",
						"filename": this.vm.filename ? this.vm.filename.name : "",
						"asondate": this.$today()
					}
				}
			};
			this.$store.commit("loading", true);
			this.$credCAPI
				.collection("var/transaction/create/upload")
				.read({body: vObj})
				.then(response => {
					if (response && response.status == "unsuccess") {
						this.$_errorMessage(response.msg || `Error while processing`);
					}
					if (response && response.status == "success") {
						this.$de_onSuccess(response.msg || "Request for position update sent successfully");
					}
					this.$store.commit("loading", false);
				})
				.catch(error => console.error(error));
		}
	}
};

function getEl() {
	return {
		MainEl: [
			{
				type: "filefield",
				label: "Select File",
				placeholder: "Enter Select File",
				name: "filename",
				rules: {required: true}
			},
		]
	};
}
</script>
