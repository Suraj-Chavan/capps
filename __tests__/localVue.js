import { createLocalVue } from "@vue/test-utils";
import credCAPI from "@/utils/credCAPI";

import VueRouter from "vue-router";
import Vuex from "vuex";

import BootstrapVue, {
	BCard,
	BCardHeader,
	BCardBody,
	BButton,
	BIconDownload,
	IconsPlugin,
} from "bootstrap-vue";

import { Globalmixin } from "@/mixins/index";
import Plugin from "@/plugins/index.js";

const setupLocalVue = () => {
	const localVue = createLocalVue();
	localVue.use(Vuex);
	localVue.use(BootstrapVue);
	localVue.use(IconsPlugin);
	localVue.prototype.$eventBus = new localVue();
	localVue.use(VueRouter);
	localVue.mixin(Globalmixin);
	localVue.use(Plugin);

	localVue.filter("commaSepWithDecimal", (value, index) => {
		if (value == null || value == "") return "-";
		if (index === "") return value;
		if (index === 0) {
			return Number(value.toFixed()).toLocaleString("en-IN");
		}
		return parseFloat(value).toLocaleString("en-IN", {
			minimumFractionDigits: index,
		});
	});

	localVue.filter("number", (value) => {
		if (value == "") {
			return;
		}

		const absValue = Math.abs(value);
		const units = ["", "k", "M", "B", "T", "Q"];
		const unitIndex = Math.floor(Math.log10(absValue) / 3);
		const unit = units[unitIndex];
		const formattedValue = value / Math.pow(10, unitIndex * 3);

		return formattedValue.toFixed(1).replace(/\.0$/, "") + unit;
	});

	localVue.filter("truncateNumber", function (value, index) {
		if (value == null) return "-";
		let num = parseFloat(value).toFixed(index);
		return num;
	});

	localVue.filter("toMillion", function (value, index) {
		if (value == null) return "-";
		else if (parseInt(value) == 0) return 0;
		else
			return (
				(parseFloat(value) / 1000000).toLocaleString(undefined, {
					maximumFractionDigits: index ? index : 2,
				}) + "M"
			);
	});
	localVue.filter("capitalize", function (value) {
		if (value == null) return "-";
		return value.toString().replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	});

	localVue.component("b-card", BCard);
	localVue.component("b-card-header", BCardHeader);
	localVue.component("b-card-body", BCardBody);
	localVue.component("b-button", BButton);
	localVue.component("b-icon-download", BIconDownload);
	localVue.prototype.$credCAPI = credCAPI;
	localVue.prototype.$config = config;

	return localVue;
};

export const router = new VueRouter();

export default setupLocalVue;
