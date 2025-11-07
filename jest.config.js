// jest.config.js
module.exports = {
	preset: "@vue/cli-plugin-unit-jest",
	setupFilesAfterEnv:['<rootDir>/__tests__/__mocks__/jest.setup.js'],
	testMatch: [
		'**/src/**/*.tests.js',
		// '**/src/**/*.spec.js',
	],	
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"^Plotly$": "<rootDir>/__mocks__/plotlyMock.js",
		"^@tests/(.*)$": "<rootDir>/__tests__/$1",
	},
	transform: {
		"^.+\\.vue$": "@vue/vue2-jest",
		"^.+\\.js$": "babel-jest",
	},
	transformIgnorePatterns: [],
	globals: {
		config: {
			baseURL: "/",
			jsonserver: false,
			JREST: "http://localhost:50001", //JREST
			NREST: "/NREST", //NREST
			PYTHON: "/JREST",
			NSERVER: true, // NOTIFICATIONS
			MEGAMENU: true,
			MACRO: true,
			CARD_VIEW: false,
			NCollection: "var", // NOTIFICATIONS ROOM
			globalDateFormatLong: "MM-DD-YYYY HH24:mi:ss",
			globalDateFormatShort: "MM-DD-YYYY",
			globalTimeFormat: "hh:mm:ss",
			applanguage: "en",
			var: {
				amount: "1",
				showNote: false,
				showLimitColumns: true,
			},

			fillDummyData: false,

			amtdecimal: 4,

			settlementDays: "2",
			remoteApplicationDetails: {
				remoteApp1: {
					appName: "app_components", // Remote federated app name
					// remoteURL: "/STD/Apps/app-components/dist/remoteEntry.js", // URL of remote federated application
					remoteURL: "/IWF_APPS/credcomponents/remoteEntry.js",
					federatedModules: {
						// Exposed modules of remote application.
						Macro: "./Macro",
						// Notification: "./BaseNotification",
						FileUpload: "./FileUpload",
						MegaMenu: "./MegaMenu",
						ThemeChanger: "./ThemeChanger",
					},
				},
			},
		},
	},
};
