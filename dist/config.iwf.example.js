var config = {}

config.baseURL = '/';
config.jsonserver = false;
config.JREST = "http://localhost:50001"; //JREST
config.NREST = "/NREST"; //NREST
config.PYTHON = "/JREST";
config.NSERVER = true; // NOTIFICATIONS
config.MEGAMENU = true;
config.MACRO = true;
config.CARD_VIEW = false;
config.globalDateFormatLong = "MM-DD-YYYY hh:mm:ss";
config.globalDateFormatShort = "MM-DD-YYYY"
config.globalTimeFormat = "hh:mm:ss";
config.applanguage = "en";

config.fillDummyData = false


config.amtdecimal = 4;

config.settlementDays = '2';

// micro frontend
config.remoteApplicationDetails = {
  remoteApp1: {
      appName: "app_components", // Remote federated app name
      remoteURL: "/oneview/appcomponents/dist/remoteEntry.js", // URL of remote federated application
      federatedModules: {
          // Exposed modules of remote application.
          Macro: "./Macro",
          FileUpload: "./FileUpload",
          HeaderBar: "./HeaderBar",
          DashboardRouterWrapper: "./DashboardRouterWrapper",
      }
  },
  remoteApp2: {
    appName: "page_builder", // Remote federated app name
    remoteURL: "/oneview/page-builder/dist/remoteEntry.js", // URL of remote federated application
    federatedModules: {
      PageDisplay: "./PageDisplay",
      PageBuilderStore: "./PageBuilderStore"
    },
  },
  remoteApp3: {
    appName: "capps_vue3_package",
    remoteURL: "/capps/dist__vue3-mfe/capps_vue3_package.js", // URL of remote federated application
  },
};



// Change the getItem functions argument according to your sessionStorages respective Keys
config.getSessionStorage = () => ({ 
  ...sessionStorage,
  userid: sessionStorage.getItem("_userid"),
  user_name: sessionStorage.getItem("_user_name"),
  sessionid: sessionStorage.getItem("_ticket"),
  roles: function() {
      // RoleIDs should be returned as an array by this function.
      const roles = new Function("return " + (sessionStorage.getItem("roles") || "[]"))();
      return roles.map(item => item.role);
  }
});

config.signOutConfiguration = {}
config.appname = "iwf"
config.changePwdConfiguration = {}
config.productName = "iDeal Wealth & Funds";