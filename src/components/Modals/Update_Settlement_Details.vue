<template>
	<ModalView
		size="xxl"
		:title="this.localeEl.ModalTitle"
		class="update_settlement_details"
	>
		<template v-slot:body>
			<!-- {{ vm }} -->
			<ValidationObserver ref="formObserver" slim>
				<b-form autocomplete="off" @submit.prevent="onUpdate">
					<!-- {{dataSource[0]}} -->

					<b-table-simple
						thead-class="thead-dark"
						striped
						sm
						borderless
						head-variant="dark"
						responsive="sm"
					>
						<b-tbody>
							<ValidationObserver
								v-for="(item, index) in dataSource"
								v-slot="{ invalid }"
								:key="index"
								slim
								tag="tr"
							>
								<b-td>
									<div class="card-info">
										<b-card no-body>
											<b-card-header>
												<div class="d-flex justify-content-between">
													<b
														class="text-capitalize pr-2 text-truncate"
														:title="item.SECURITY"
													>
														{{ item.SECURITY }}
													</b>
													<div>
														<b-badge v-if="collection == 'transaction'">{{
															item.TRANS_TYPE_NAME
														}}</b-badge>

														<b-badge
															v-else
															pill
															:variant="item.SETTLED_STATUS | settled_status_variant"
															>{{ item.SETTLED_STATUS | settled_status_label }}</b-badge
														>
													</div>
												</div>
												<div class="icon_wrap">
													<!-- <span v-if="item.TRANS_TYPE_CODE">Trans No. </span>
												<span v-else>Settlement No. </span>
											 -->
													<span v-if="collection == 'transaction'"
														>Trans No. #{{ item.TRANS_NO }}</span
													>
													<span v-else>Settlement No. #{{ item.SETTLEMENT_NO }}</span>
												</div>
											</b-card-header>
											<b-card-footer class="d-flex justify-content-between">
												<div class="text-center">
													{{ item.CURRENCY }} {{ item.AMOUNT || 0 | number("0a") }}
												</div>
												<div class="text-truncate" :title="item.CLIENT_NAME">
													{{ item.CLIENT_NAME | capitalize }}
												</div>
											</b-card-footer>
										</b-card>
									</div>
								</b-td>

								<b-td>
									<FormElementWithValidation
										:item="{
											type: 'text',
											name: 'BANK_ID',
											rules: { required: true, max: [255] },
										}"
										:locale="localeEl.fields"
										v-model="vm[index]['BANK_ID']"
									>
									</FormElementWithValidation>
								</b-td>
								<b-td>
									<FormElementWithValidation
										:item="{
											type: 'numericOnly',
											name: 'BANK_AC_NO',
											rules: { required: true, max: [255] },
										}"
										:locale="localeEl.fields"
										v-model="vm[index]['BANK_AC_NO']"
									>
									</FormElementWithValidation>
								</b-td>
								<b-td>
									<FormElementWithValidation
										:dataset="ds['SETTLEMENT.INSTRUMENT_TYPE']"
										:item="{
											type: 'select',
											ds: 'SETTLEMENT.INSTRUMENT_TYPE',
											'ds-code': 'CODE',
											'ds-name': 'DESCR',
											name: 'INSTRUMENT_TYPE',
											rules: { required: true, max: [50] },
										}"
										:locale="localeEl.fields"
										v-model="vm[index]['INSTRUMENT_TYPE']"
									>
									</FormElementWithValidation>
								</b-td>
								<b-td>
									<FormElementWithValidation
										:item="{
											type: 'date',
											name: 'INSTRUMENT_DATE',
											rules: { required: true },
										}"
										:locale="localeEl.fields"
										v-model="vm[index]['INSTRUMENT_DATE']"
									>
									</FormElementWithValidation>
								</b-td>
								<b-td>
									<FormElementWithValidation
										:item="{
											type: 'numericOnly',
											name: 'INSTRUMENT_NO',
											rules: { required: true, max: [50] },
										}"
										:locale="localeEl.fields"
										v-model="vm[index]['INSTRUMENT_NO']"
									>
									</FormElementWithValidation>
								</b-td>
								<b-td>
									<FormElementWithValidation
										:item="{
											type: 'text',
											name: 'REMARKS',
											rules: { required: true, max: [4000] },
										}"
										:locale="localeEl.fields"
										v-model="vm[index]['REMARKS']"
									>
									</FormElementWithValidation>
								</b-td>
								<b-td>
									<b-button
										@click="onUpdate(vm[index], index, false)"
										class="btn btn-primary text-white mt-3"
										variant="default"
										:disabled="invalid"
										>Save</b-button
									>
								</b-td>
							</ValidationObserver>
						</b-tbody>
					</b-table-simple>

					<!-- <b-table
							sort-by.sync="sortBy"
							thead-class="thead-dark"
							striped
							sm
							borderless
							sticky-header
							head-variant="dark"
							responsive="sm"
							:items="dataSource"
							:fields="fields"
						>
						<template #row-details="row">
							asdaskdl
						</template>
							<template #cell(INFORMATION)="data">
								<div class="card-info">
									<b-card no-body>
										<b-card-header>
											<div class="d-flex">
												<b class="text-capitalize">
													{{ data.item.SECURITY || data.item.BANK_ID }}
												</b>
												<span class="ml-auto">
													<b-badge pill>{{ data.item.CLIENT_ACCOUNT_NO }}</b-badge>
												</span>
											</div>
											<div class="icon_wrap">
												#{{data.item.TRANS_NO || data.item.SETTLEMENT_NO}}
											</div>
										</b-card-header>
										<b-card-footer class="d-flex justify-content-between">
											<div>
												<span class="badge">{{ data.item.TRANS_TYPE_CODE || data.item.INSTRUMENT_TYPE }}</span>
											</div>
											<div class="text-center">
												{{ data.item.CURRENCY }}{{ data.item.AMOUNT || 0 | convertCommaString }}
											</div>
											<div class="text-center">
												{{ data.item.CLIENT_ACCOUNT_NO }}
											</div>
										</b-card-footer>
									</b-card>
								</div>
							</template>

							<template #cell(BANK)="data">
								<FormElementWithValidation
									:item='{
										type: "text",
										name: "BANK_ID",
										rules: { required: true, max: [255] }
									}'
									:locale="localeEl.fields"
									v-model="vm[data.index]['BANK_ID']"
								>
								</FormElementWithValidation>
							</template>
							<template #cell(BANK_AC_NO)="data">
								<FormElementWithValidation
									:item='{
										type: "numericOnly",
										name: "BANK_AC_NO",
										rules: {required: true, max: [255] },
									}'
									:locale="localeEl.fields"
									v-model="vm[data.index]['BANK_AC_NO']"
								>
								</FormElementWithValidation>
							</template>
							<template #cell(INSTRUMENT_TYPE)="data">
								<FormElementWithValidation
									:dataset="ds['SETTLEMENT.INSTRUMENT_TYPE']"
									:item='{
										type: "select",
										ds: "SETTLEMENT.INSTRUMENT_TYPE",
										"ds-code": "CODE",
										"ds-name": "DESCR",
										name: "INSTRUMENT_TYPE",
										rules: {required: true, max: [50] },
									}'
									:locale="localeEl.fields"
									v-model="vm[data.index]['INSTRUMENT_TYPE']"
								>
								</FormElementWithValidation>
							</template>
							<template #cell(INSTRUMENT_DATE)="data">
								<FormElementWithValidation
									:item='{
										type: "date",
										name: "INSTRUMENT_DATE",
										rules: { required: true },
									}'
									:locale="localeEl.fields"
									v-model="vm[data.index]['INSTRUMENT_DATE']"
								>
								</FormElementWithValidation>
							</template>
							<template #cell(INSTRUMENT_NO)="data">
								<FormElementWithValidation
									:item='{
										type: "numericOnly",
										name: "INSTRUMENT_NO",
										rules: {required: true, max: [50] },
									}'
									:locale="localeEl.fields"
									v-model="vm[data.index]['INSTRUMENT_NO']"
								>
								</FormElementWithValidation>
							</template>
							<template #cell(REMARKS)="data">
								<FormElementWithValidation
									:item='{
										type: "text",
										name: "REMARKS",
										rules: { required: true, max: [4000] },
									}'
									:locale="localeEl.fields"
									v-model="vm[data.index]['REMARKS']"
								>
								</FormElementWithValidation>
							</template>
							<template #cell(Actions)="data">
								<b-button
									@click="onUpdate(vm[data.index], data.index)"
									class="btn btn-primary text-white mt-3"
									variant="default"
									>Save</b-button
								>
							</template>
						</b-table> -->
				</b-form>
			</ValidationObserver>
		</template>
		<template v-slot:footer>
			<button @click="onUpdate(vm, null, true)" class="btn btn-primary">
				<span>Save All</span>
			</button>
		</template>
	</ModalView>
</template>

<script>
import { DataEntryMixin } from "@/mixins/data-entry-mixin";

export default {
	name: "UpdateSpreadForm",
	mixins: [DataEntryMixin],
	data: () => ({
		localeName: "update_settlement_details",
		vm: [],
		ds: {},
		ds_prefetched: {},
		fields: [
			"INFORMATION",
			"BANK",
			"BANK_AC_NO",
			"INSTRUMENT_TYPE",
			"INSTRUMENT_DATE",
			"INSTRUMENT_NO",
			"REMARKS",
			"Actions",
		],
		dataSource: [],
		collection: "",
		reference: [],
		referenceKey: "",
	}),
	computed: {
		localeEl() {
			return this.$t(this.localeName);
		},
	},
	filters: {
		settled_status_label: function (value) {
			if (!value) return "";

			if (value === "C") {
				return "Cancelled";
			} else if (value === "Y") {
				return "Settled";
			} else if (value === "N") {
				return "Pending";
			}
		},
		settled_status_variant: function (value) {
			if (!value) return "";

			if (value === "C") {
				return "danger";
			} else if (value === "Y") {
				return "primary";
			} else if (value === "N") {
				return "info";
			}
		},
	},
	created() {
		this.reference = this.$route.query.reference.split(",");
		this.referenceKey = this.$route.query.scope;
		this.collection = this.$route.query.collection;
		this.getDatalist();
		// this.fetchData();
	},
	methods: {
		async onUpdate(data, index, isSaveAll) {
			let vObj = {};
			const success = await this.$refs.formObserver.validate();
			if (!success) return this.$de_showErrors(this.$refs.formObserver);
			
			if (isSaveAll) {
				let mapObj = [];
				data.map((el) => {
					mapObj.push({
						[this.$route.query.scope]: el[this.$route.query.scope] || "",
						BANK_ID: el.BANK_ID || "",
						BANK_AC_NO: el.BANK_AC_NO || "",
						INSTRUMENT_TYPE: el.INSTRUMENT_TYPE || "",
						INSTRUMENT_DATE: el.INSTRUMENT_DATE || "",
						INSTRUMENT_NO: el.INSTRUMENT_NO || "",
						REMARKS: el.REMARKS || "",
					});
				});
				const PROCESS_ID = await this.$showProcessStatus.getPorcessId();
				const processid = "Settelement" + "_" + PROCESS_ID;
				
				vObj = {
					data: mapObj,
					_custparams: this.additionalDetails_formdata || {},
					processid
				};
			} else {
				this.vm[index] = {
					...this.vm[index],
					...data,
				};
				vObj = this.createDataObj(this.vm[index], this.additionalDetails_formdata);
			}

			(function fn() {
				vObj["_ignore_prc_con"] = this.ignore_prc_con;
				!isSaveAll && this.$store.commit("loading", true);
				this.$credCAPI
					.collection(`irda/${this.collection}/update/settleinst`)
					.create({body: vObj})
					.then((response) => {
						!isSaveAll && this.$store.commit("loading", false);
						if (isSaveAll) (response && response.status === "success") && this.$router.go(-1);
						else this.$responseHandler(response, fn, this, "dontGoToMainScreen");
						this.$store.commit("ChoseRecord/RESET");
      					this.$store.commit("OnActionPerformed", true);
					})
					.catch((error) => console.error(error));
			}.call(this));

			isSaveAll && this.$showProcessStatus({ processName: vObj.processid })
		},
		createDataObj(vm, additionalDetails_formdata) {
			let refObj = {};
			refObj[this.referenceKey] = vm[this.referenceKey];
			console.log(refObj);
			return {
				data: {
					...refObj,
					REMARKS: vm.REMARKS || "",
					BANK_ID: vm.BANK_ID || "",
					BANK_AC_NO: vm.BANK_AC_NO || "",
					INSTRUMENT_TYPE: vm.INSTRUMENT_TYPE || "",
					INSTRUMENT_DATE: vm.INSTRUMENT_DATE || "",
					INSTRUMENT_NO: vm.INSTRUMENT_NO || "",
				},
				_custparams: additionalDetails_formdata || {},
			};
		},
		fetchData(filters) {
			this.$store.commit("loading", true);
			const vObj = {
					filter: this.reference
						? [
								{
									field: this.referenceKey,
									value: this.reference,
									asgn: "in",
									type: "string",
								},
						  ]
						: [],
			};

			this.$credCAPI
				.collection(`irda/${this.collection}/read`)
				.read({body: vObj})
				.then((response) => {
					this.dataSource = response || [];
					response.forEach((element, index) => {
						this.vm.push(element);
					});

					this.screen_loading = false;
					this.$store.commit("loading", false);
				})
				.catch((error) => console.error(error));
		},
		getDatalist() {
			this.$store.commit("loading", true);

			const list = [
				"COMMON.BROKER",
				"SETTLEMENT.INSTRUMENT_TYPE",
				"COMMON.CURRENCY",
				"COMMON.AUTHORISE",
			];

			this.$_getDatalist(list).then((response) => {
				if (response) {
					this.ds = { ...response[0], ...response[1] };
					this.ds_prefetched = { ...this.ds };
					this.$store.commit("loading", false);

				}
			});
		},
	},
};
</script>
<style lang="scss">
.update_settlement_details {
	.table-responsive-sm {
		min-height: 500px;
	}
	.form-control,
	.v-select {
		background: #fff;
		font-size: 0.8rem;
	}
	.table .thead-dark {
		display: none;
	}
	.table td {
		vertical-align: middle;
	}
	.card-info {
		width: 200px;
		.card {
			background: #f7f7f7;
			font-size: 0.8rem;
			border: solid 1px #eee;
			.card-header {
				border: 0;
				background: transparent;
				padding: 0.3rem;
				.badge {
					padding: 3px 10px;
				}
				.badge.badge-primary {
					background: var(--blue-sky);
					color: rgba($color: #fff, $alpha: 0.8);
				}
				h4 {
					margin: 0 0 0 0;
					color: var(--blue-dark);
					font-size: 1.2rem;
					font-weight: 600;
				}
				h4 a {
					text-decoration: none;
					color: initial;
				}
				h4 a:hover {
					color: var(--blue);
				}
				.date {
					font-size: 0.8rem;
					img {
						height: 14px;
					}
				}
				label {
					cursor: pointer;
				}
			}
			.card-body {
				.card-content,
				.card-content-expanded {
					display: grid;
					gap: 0.1rem;
					// align-items: center;
				}
				.hd {
					color: var(--gray-text);
					font-size: 0.9rem;
				}
				.cont {
					color: var(--black);
					font-weight: 600;
				}
			}
			.card-footer {
				padding: 0.3rem;
				border-top-color: var(--gray-light);
				background: transparent;
				.btn {
					padding-top: 0;
					padding-bottom: 0;
				}
				.badge {
					font-size: 0.7rem;
					border-radius: 20px;
					padding: 0 5px;
					line-height: normal;
				}
			}
		}
	}
}
</style>
