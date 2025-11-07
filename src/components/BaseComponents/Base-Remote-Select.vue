<template>
		<v-select
		  ref="vselect"
		  :placeholder="placeholder"
		  :filterable="false"
		  :label="computedLabel"
		  :options="options"
		  v-bind="props"
		  :value="mainSelect2Model"
		  v-on="vueSelectListeners"
		  @open="dropDownIsOpen = true"
		  @close="dropDownIsOpen = false"
		  @input="updateValue"
		  @search="onSearch"
		  @option:deselected="removeOption"
		  @option:selected="emitPreviousEvents"
		  @option:selecting="selecting"
		  @search:blur="atBlurData"
		  append-to-body
		  :calculate-position="withPopper"
		>
			<template #selected-option="item">
				<div style="display: flex; align-items: baseline">
					<strong>{{ item[dsName] || '' }}</strong>
					&nbsp;
					<span>
						{{ item[dsCode] != item[dsName] ? '-  ' + item[dsCode] || '' : '' }}
					</span>
				</div>
			</template>
			<template #option="item">
				<div style="">
					<span>
						<strong>{{ item[dsName] }}</strong>
						<span>
							{{ item[dsCode] != item[dsName] ? '- ' + item[dsCode] || '' : '' }}
						</span>
					</span>
					<br />
					<span>{{ subLabelLiterals.replace(/{(.*?)}/g, (_, key) => item[key] || '') }}</span>
				</div>
			</template>
		  	<template v-slot:no-options > {{ placeholderText }} </template>
		</v-select>
  </template>
  
  <script>
  import vSelect from "vue-select";
  import { createPopper } from "@popperjs/core";
  
  const debounce = function (fn, delay) {
	  var timeoutID = null;
	  return function () {
		clearTimeout(timeoutID);
		var args = arguments;
		var that = this;
		timeoutID = setTimeout(function () {
		  fn.apply(that, args);
		}, delay);
	  };
	},
	freezeOptions = (options) => Object.freeze(options),
	isValueExistsInOptions = (options, value, key = "ID") =>
	  (options || []).some((O) => O[key] === value),
	uniqueByProp = (prop) => (arr) => {
	  const seen = new Set();
	  return arr.filter((el) => {
		el[prop] = "" + el[prop];
		el.ID = "" + el.ID;
		const duplicate = seen.has(el[prop]);
		seen.add(el[prop]);
		return !duplicate;
	  });
	},
	NREST = window.config.NREST || "/NREST/";
  
  export default {
	components: {
	  vSelect,
	},
  
	props: {
	  value: null,
  
	  allowJsonData: {
		type: Boolean,
		default: false,
	  },
	  vueSelectListeners: {
		type: Object,
		default: function () {
		  return {};
		},
	  },
	  isExpression: {
		type: Boolean,
		default: true,
	  },
	  page: {
		type: Object,
		default: function () {
		  return {
			start: 0,
			limit: 50,
		  };
		},
	  },
	  className: {
		type: String,
		default: "",
	  },
	  cls: {
		type: String,
		default: "",
	  },
	  dataList: {
		type: String,
	  },
	  dsCode: {
		type: String,
		required: true,
	  },
	  dsName: {
		type: String,
		required: true,
	  },
	  subLabelLiterals: {
		type: String,
		default: ""
	  },
	  allowblank: {
		type: String,
		required: false,
	  },
	  placeholder: {
		type: String,
		default: "Select"
	  },
	  fieldlist: {
		type: String,
		default: "",
	  },
	  hide: {
		type: [String, Boolean, Object],
		default: true,
	  },
	  sort: {
		type: [Object, Function],
		default: function () {
			return {};
		},
	  },
	  filter: {
		type: [Array, Function],
			default: function () {
				return [];
			},
		},
	  parentWrapperClass: {
		type: String,
		default: "form-group",
	  },
	  errorMsg: {
		type: String,
		default: "",
	  },
	  clearOptions: {
		type: Boolean,
		default: false,
	  },
  
	  url: {
		type: String,
		default: NREST + "datalist/remoteread",
	  },
	  urlPayloadOptions: {
		type: Object,
		default() {
		  return null;
		},
	  },
	},
  
	data() {
	  return {
		selectedOptions: [],
		options: [],
		placeholderText: "Type here to search",
		payload: [],
		internalValue: [],
		computedLabel: this.dsName,
		computedCodeField: this.dsCode,
		dropDownIsOpen: false
	  };
	},
  
	created() {
	  this.computedLabel = this.dsName;
	  this.computedCodeField = this.dsCode;
	},
  
	watch: {
	  value: {
		handler(val) {
		  this.setInternalValueFromOptions(val);
		},
		immediate: true,
	  },
	  clearOptions(bool) {
		if (bool) {
		  this.options = [];
		  this.selectedOptions = [];
		} else return;
	  },
	},
  
	computed: {
	  mainSelect2Model() {
		let value = this.internalValue;
  
		if (value) {
		  return [].concat(("" + value).split(","));
		}
  
		return [];
	  },
  
	  props() {
		return Object.assign(
		  {},
		  {
			reduce: this.defaultReducer(),
			taggable: false,
		  },
		  this.$attrs
		);
	  },
  
	  isMultiSelect() {
		return this.props.multiple === true;
	  },
	},
  
	methods: {
	  atBlurData(obj) {
		this.$emit("search:blur", obj);
	  },
	  atChange(obj) {
		this.$emit("chagedData", {
		  payload: obj,
		  value: this.value,
		});
		this.$emit('change', this.internalValue)
	  },
	  selecting(obj) {
		this.$emit("option:selecting", obj);
	  },
	  emitPreviousEvents(obj) {
		this.$emit("selected:option", obj);
		this.atChange(obj);
		setTimeout(() => {
		  this.$emit("filteredData", {
			payload: obj,
			originalPayload: this.payload,
		  });
		}, 0);
	  },
  
	  withPopper(dropdownList, component, { width }) {
		dropdownList.style.width = width;
		dropdownList.classList.remove("form-select-box");
		dropdownList.classList.add("form-select-box");
		const popper = createPopper(component.$refs.toggle, dropdownList, {
		  placement: "bottom",
		  modifiers: [
			{
			  name: "offset",
			  options: {
				offset: [0, -1],
			  },
			},
			{
			  name: "toggleClass",
			  enabled: true,
			  phase: "write",
			  fn({ state }) {
				component.$el.classList.toggle(
				  "drop-up",
				  state.placement === "top"
				);
			  },
			},
		  ],
		});
  
		return () => popper.destroy();
	  },
  
	  async setInternalValueFromOptions(value) {
		this.getOptions(value);
		if (this.isMultiSelect === true) {
		  value = value == null || value === "" ? null : value.split(",");
		  this.internalValue = value;
		} else {
		  this.internalValue = value;
		}
	  },
  
	  updateValue(value) {
		if (value !== null) {
		  if (Array.isArray(value)) {
			value = value.join(",");
		  }
		}
  
		this.$emit("input", value == null ? "" : value);
	  },
  
	  async getOptions(value) {
		if (value == null || value === "") {
		  this.selectedOptions = [];
		  this.selectedOptions.length = 0;
		  this.options = [];
		  this.options.length = 0;
		  return;
		}
  
		// Exiting early cause value is changing by user input and not by programmatically
		if(this.dropDownIsOpen) return;
  
		const IS_VALUE_EXISTS_IN_OPTIONS = isValueExistsInOptions(
		  this.selectedOptions,
		  value
		);
  
		if (this.isMultiSelect === false && !IS_VALUE_EXISTS_IN_OPTIONS)
		  return await this.getOptionsForManuallyChangedValue(value);
  
		if (this.isMultiSelect === true) {
		  const filteredValues = value.split(",").filter((optionCode) => {
			const IS_VALUE_EXISTS_IN_OPTIONS2 = isValueExistsInOptions(
			  this.selectedOptions,
			  optionCode
			);
			return !IS_VALUE_EXISTS_IN_OPTIONS2;
		  });
  
		  if (filteredValues.length > 0) {
			await this.getOptionsForManuallyChangedValue(
			  filteredValues.join(",")
			);
		  }
		}
	  },
  
	  getJSONdata(fieldlist) {
		if (!this.isExpression) return fieldlist;
		let regex = /\[([^\]]*)\]/g;
		if (!fieldlist) return [];
		let expression = fieldlist.match(regex);
		let expr = "",
		  exprVal = "";
		if (expression) {
		  for (var i = 0; i < expression.length; i++) {
			expr = expression[i].replace("[", "").replace("]", "");
			exprVal = document.querySelector("#" + expr).value;
			fieldlist = fieldlist.replace(expression[i], exprVal);
		  }
		}
		fieldlist = "[" + fieldlist + "]";
		return fieldlist;
	  },
  
	  defaultReducer() {
		const vm = this;
		return function (obj) {
		  if (obj == null || obj == "") return null;
		  vm.computedLabel = vm.dsName;
		  vm.computedCodeField = vm.dsCode;
		  const VALUE = obj[vm.dsCode];
		  if (!isValueExistsInOptions(vm.selectedOptions, VALUE)) vm.selectedOptions.push(obj);
		  return VALUE;
		};
	  },
  
	  getOptionsForManuallyChangedValue(newVal) {
		let loading = () => {};
  
		if (this.$refs.vselect && this.$refs.vselect.toggleLoading)
		  loading = this.$refs.vselect.toggleLoading;
  
		loading(true);
  
		const vm = this,
		  URL_PAYLOAD_OPTIONS = Object.create(null);
  
		if (vm.urlPayloadOptions == null) {
		  // Default REMOTE read options
		  Object.assign(URL_PAYLOAD_OPTIONS, {
			url: vm.url,
			body: {
			  _ticket: sessionStorage.getItem("_ticket"),
			  dataset: vm.dataList,
			  codefield: vm.dsCode,
			  namefield: vm.dsName,
			  multiple: vm.isMultiSelect,
			  filter: [
					{
						field: vm.dsCode,
						value: vm.isMultiSelect ? newVal.split(",") : newVal,
						asgn: vm.isMultiSelect ? "in" : "eq",
						type: "string",
					},
				],
			  ids: "" + newVal,
			  prepopulate: true,
			  page: vm.page,
			},
		  });
		  if (vm.dataList === "ds-customdata" || vm.allowJsonData)
			URL_PAYLOAD_OPTIONS.body.jsondata = vm.getJSONdata(vm.fieldlist);
		  URL_PAYLOAD_OPTIONS.body = URL_PAYLOAD_OPTIONS.body;
		} else {
		  Object.assign(URL_PAYLOAD_OPTIONS, vm.urlPayloadOptions);
		  URL_PAYLOAD_OPTIONS.url = URL_PAYLOAD_OPTIONS.url || vm.url;
		  URL_PAYLOAD_OPTIONS.body = URL_PAYLOAD_OPTIONS.body;
		}
  
		vm.$credCAPI
			.collection(URL_PAYLOAD_OPTIONS.url)
			.read({ body: URL_PAYLOAD_OPTIONS.body })
			.then((payload) => {
				vm.payload = vm.payload = Array.isArray(payload) ? payload : (payload || {}).data || [];;
				const options = [
					...JSON.parse(JSON.stringify(vm.payload)),
					...(vm.selectedOptions || []),
				];
				// Searching if any option is not fetched, for passed values, if not fetched it will set codefield and namefield same with passed value.
				const valuesMap = ("" + vm.value).split(",");
				const payloadMap = options.map((item) => item[vm.dsCode]);
				valuesMap.reduce((acc, curr) => {
					if (!payloadMap.includes(curr)) acc.push({ [vm.dsCode]: curr, [vm.dsName]: curr });
					return acc;
				}, options);
				vm.selectedOptions = vm.unifiedArray(options);
				vm.options = freezeOptions(
					JSON.parse(JSON.stringify(vm.selectedOptions))
				);
				setTimeout(() => {
					vm.$emit("filteredData", {
						payload: vm.options.filter((item) => item[vm.dsCode] == newVal)[0],
						originalPayload: vm.payload,
					});
				}, 0);
				loading(false);
			})
			.catch((e) => {
				loading(false);
			});
	  },
  
	  unifiedArray(array) {
		const uniqueById = uniqueByProp(this.computedCodeField);
		return uniqueById(array);
	  },
  
	  onSearch(search, loading) {
		loading(true);
		this.search(loading, search, this);
	  },
  
	  search: debounce((loading, search, vm) => {
		/** 
		if (search.length < 3) {
			vm.placeholderText = "Please enter 3 or more characters";
			return loading(false);
		}
		*/
  
		vm.placeholderText = "Type here to search";
  
		if (search == null || search == "") return loading(false);
  
		const URL_PAYLOAD_OPTIONS = Object.create(null);
  
		if (vm.urlPayloadOptions == null) {
		  // Default REMOTE read options
		  Object.assign(URL_PAYLOAD_OPTIONS, {
			url: vm.url,
			body: {
			  _ticket: sessionStorage.getItem("_ticket"),
			  dataset: vm.dataList,
			  codefield: vm.dsCode,
			  namefield: vm.dsName,
			  query: search,
			  jsondata: vm.getJSONdata(vm.fieldlist),
			  page: vm.page,
			  filter: [
				{
					field: vm.dsName,
					value: search,
					asgn: "like",
					type: "string",
				},
				...(typeof vm.filter === 'function' ? vm.filter() : vm.filter),
				],
				sort: (typeof vm.sort === 'function' ? vm.sort.call(vm) : vm.sort),
			},
			loader: false,
		  });
		  URL_PAYLOAD_OPTIONS.body = URL_PAYLOAD_OPTIONS.body;
		} else {
		  Object.assign(URL_PAYLOAD_OPTIONS, vm.urlPayloadOptions);
		  URL_PAYLOAD_OPTIONS.url = URL_PAYLOAD_OPTIONS.url || vm.url;
		  URL_PAYLOAD_OPTIONS.body = URL_PAYLOAD_OPTIONS.body;
		}
		vm.$credCAPI
				.collection(URL_PAYLOAD_OPTIONS.url)
				.read({ body: URL_PAYLOAD_OPTIONS.body })
				.then((json) => {
					vm.payload = Array.isArray(json) ? json : (json || {}).data || [];
					let options = freezeOptions(
						vm.unifiedArray([
							...(vm.payload || []),
							...(vm.selectedOptions || []),
						])
					);
		
					if (vm.payload == 0) {
					vm.options = [];
					vm.placeholderText = "No data found";
					setTimeout(() => (vm.options = options), 1000);
					} else {
					vm.options = options;
					}
					
					loading(false);
					setTimeout(() => (vm.placeholderText = "Type to search"), 3000);
				})
				.catch((e) => {
					loading(false)
					console.error(e)
				});
	  }, 350),
  
	  removeOption(option) {
		this.$emit("change", this.internalValue);
		if (this.isMultiSelect === false) return;
		let selectedOptions = JSON.parse(
		  JSON.stringify(
			this.selectedOptions.filter((obj) => obj["ID"] != option["ID"])
		  )
		);
		let options = this.options.filter((obj) => obj["ID"] != option["ID"]);
		this.selectedOptions = selectedOptions;
		this.options = this.unifiedArray([
		  ...(selectedOptions || []),
		  ...(options || []),
		]);
	  },    
	},
  };
  </script>
  
  
  <style lang="scss">
  .select {
	.select2-selection__placeholder {
	  color: #000 !important;
	}
  }
  </style>
  