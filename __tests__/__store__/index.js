// tests/setupStore.js
import Vuex from "vuex";

const setupStore = (
	stateOverrides = {},
	mutationsOverrides = {},
	actionsOverrides = {}
) => {
	const state = {
		introdata: [],
		filter_config: { VAR_NAME: "HS-99-252-LOG-EQUAL-30D" },
		varper_amt: "var_per",
		stats_filers: "PORTFOLIO",
		exceptions: [],
		localeEl: {
			PageTitle: "VaR",
			ModalTitle: "VaR",
			PageTitlePendingOrder: "",
			PageTitleOrderMandate: "",
			PageTitleOrderConfirmation: "",
			Notes: {
				Note1:
					"Exception occurred while calculating VaR for your chosen configurations. A detailed log for that is given below.",
				Note2: "Note: Forex asset class supports only Historical VaR Method",
			},
			headings: {
				Asset_class: "ASSET CLASS",
				Portfolio: "PORTFOLIO",
				CURRENCY: "CURRENCY",
				SECURITYWISE_RESULTS: "SECURITYWISE RESULTS",
				Instrumentwise_results: "INSTRUMENTWISE RESULTS",
				ALL: "ALL",
				FIXED_INCOME: "FIXED INCOME",
				EQUITY: "EQUITY",
				MUTUAL_FUNDS: "MUTUAL FUNDS",
				TOP_CONTRIBUTORS: "TOP CONTRIBUTORS",
				VaR_VARIATIONS: "VaR VARIATIONS",
				VaR_Exception_Log: "VaR Exception Log",
			},
			fields: {
				VIEW_RETURN: "VIEW RETURNS",
				MARKET_VALUE: "MARKET VALUE",
				"VAR%": "VaR %",
				VAR_AMOUNT: "VaR AMOUNT",
				CVAR: "CVaR",
				VAR_LIMIT: "VaR LIMIT",
				LIMIT_STATUS: "LIMIT STATUS",
				VAR_NAME: "VaR NAME",
				VAR_DATE: "VaR DATE",
				METHOD: "METHOD",
				HOLDING_PERIOD: "HOLDING PERIOD",
				LOOK_BACK_PERIOD: "LOOK BACK PERIOD",
				METHODS: "METHODS",
				CONFIDENCE_LEVEL: "CONFIDENCE LEVEL",
				RETURNS_TYPE: "RETURNS TYPE",
				RETURNS_WEIGHTAGE: "RETURNS WEIGHTAGE",
				HORIZON: "HORIZON",
				DAYS: "DAYS",
				Exceptions: "Exceptions",
				Exception_Category: "Exception Category",
				Security: "Security",
				Exception_Details: "Exception Details",
				Actionable: "Actionable",
				"NO.": "NO.",
				Show_Filters: "SHOW FILTERS",
			},
			actions: {
				VIEW_RESULTS: "View Results",
				Calculate_VAR: "Calculate VaR",
				Overwrite: "Overwrite",
				Overwrite_with_Working_Sheet: "Overwrite with Working Sheet",
				Calculate: "Calculate",
				Close: "Close",
				Calculate_with_Working_Sheet: "Calculate with Working Sheet",
				No: "No",
				Yes: "Yes",
				Saved_Results: "Saved results",
			},
			filters: {
				FILTERS: "FILTERS",
				METHODS: "METHODS",
				CONFIDENCE_LEVEL: "CONFIDENCE LEVEL",
				LOOK_BACK_PERIOD: "LOOK BACK PERIOD",
				RETURNS_TYPE: "RETURNS TYPE",
				RETURNS_WEIGHTAGE: "RETURNS WEIGHTAGE",
				HORIZON: "HORIZON",
				DAYS: "DAYS",
			},
		},
		...stateOverrides,
	};

	const actions = {
		// Define any actions here if needed
		...actionsOverrides,
	};

	const mutations = {
		assignValue(state, obj) {
			state[obj.key] = obj.value;
		},
		...mutationsOverrides,
	};

	return new Vuex.Store({
		state: {
			refCount: 0,
			isLoading: false,
			selectedFilters: [],
		},
		mutations: {
			loading: jest.fn(),
			OnSelectedFilters: jest.fn(),
			"ChoseRecord/RESET": jest.fn(),
		},
		modules: {
			Potfoliodetails: {
				namespaced: true,
				state,
				mutations,
				actions,
			},
		},
	});
};

export default setupStore;
