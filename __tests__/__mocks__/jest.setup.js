// jest.setup.js
jest.mock("@/store/modules", () => ({
	keys: () => ["appSettingsLoad", "choseRecord", "potdoliodetails"],
	resolve: () => "",
	id: "",
}));

jest.mock("plotly.js-dist-min", () => ({
	newPlot: jest.fn(),
	react: jest.fn(),
	update: jest.fn(),
	purge: jest.fn(),
	restyle: jest.fn(),
	relayout: jest.fn(),
}));

const localStorageMock = (() => {
	let store = {};

	return {
		getItem: (key) => store[key] || null,
		setItem: (key, value) => {
			store[key] = value.toString();
		},
		removeItem: (key) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

global.URL.createObjectURL = jest.fn();
