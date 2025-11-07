var config = {}
let ipAddress = "";

config.baseURL = '/';
config.jsonserver = false;
config.JREST = "http://localhost:50001"; //JREST
config.NREST = "/idealn"; //NREST
config.PYTHON = "/idealpy";
config.NSERVER = true; // NOTIFICATIONS
config.MEGAMENU = true;
config.MACRO = true;
config.CARD_VIEW = false;
config.DASHBOARD_API = "/idealn/datastore/custom_dashboard/read"; //NREST
config.DASHBOARD_HUB_GROUP  = "Visualizer-Pages"
config.globalDateFormatLong = "DD/MM/YYYY hh:mm:ss";
config.globalDateFormatShort = "DD/MM/YYYY";
config.globalTimeFormat = "hh:mm:ss";
config.applanguage = "en";

config.fillDummyData = false

config.amtdecimal = 4;

config.settlementDays = '2';
config.loginURL= ipAddress+ "/login" + (window.location.href.includes("dist") ? "/dist" : "");
config.changePWURL= ipAddress+ "/login" + (window.location.href.includes("dist") ? "/dist" : "") +"/#/reset";
config.appIcon = "credence_icon.jpg";

// micro frontend

config.remoteApplicationDetails = {
    remoteApp1: {
        appName: "app_components", // Remote federated app name
        remoteURL: "/app-component/dist/remoteEntry.js", // URL of remote federated application
        federatedModules: {
            // Exposed modules of remote application.
            Macro: "./Macro",
            FileUpload: "./FileUpload",
            HeaderBar: "./Ideal6HeaderComponent",
            DashboardRouterWrapper: "./DashboardRouterWrapper",
        }
    },
    remoteApp2: {
      appName: "page_builder", // Remote federated app name
      remoteURL: "/page-builder/dist/remoteEntry.js", // URL of remote federated application
      federatedModules: {
        PageDisplay: "./PageDisplay",
        PageBuilderStore: "./PageBuilderStore"
      },
    },
    remoteApp3: {
      appName: "capps_vue3_package",
      remoteURL: "/capps/dist__vue3-mfe/capps_vue3_package.js", //  URL of remote federated application
    },
};

config.getSessionStorage = () => ({
    ...sessionStorage,
    userid: sessionStorage.getItem("_user_id"),
    user_name: sessionStorage.getItem("_username"),
    sessionid: sessionStorage.getItem("_ticket"),
    roles: function () {
      // RoleIDs should be returned as an array by this function.
      const roles = new Function("return " + (sessionStorage.getItem("roles") || "[]"))();
      return roles.map(item => item.role);
    }
  });

config.signOutConfiguration = {
    api: "/IDEAL/REST/user/logout",
    afterSignOutAction(response) {
      console.log("You have been Sign out..", response);
      const _this = this;
      (async function() {
        if (response.status != "success") {
          return _this.$confirm({
            title: "Logout Unsuccessful",
            message: response.error || response.msg || "There was an issue logging you out. Please try again.",
            button: {
              yes: "Ok",
            },
          });
        }
        _this.$confirm({
          title: "Logout successful",
          message: (response.msg || response.error || "You have been successfully logged out. You will be redirected shortly."),
          button: {
            yes: "Ok",
          },
          callback() {
            sessionStorage.clear();
            location.href = location.origin + '/login/dist/#/'
          }
        });
      })();
    }
};
  
config.changePwdConfiguration = {};
config.productName = "Ideal 6";

config.appList = [
  {
    APP_PAGE: "limit_management/dist",
    CLS_ICON: "icon-limit",
    APP_NAME: "Limit Management"
  },
  {
    APP_PAGE: "custom-dashboard/dist",
    CLS_ICON: "icon-customdashboard",
    APP_NAME: "Custom Dashboard"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON:"icon-exceptionview",
    APP_NAME:"Exception View"
  },
  {
    APP_PAGE:"apps/asset_liability_management/dist",
    CLS_ICON:"icon-asset-liability",
    APP_NAME:"Asset Liability Management"
  },
  {
    APP_PAGE:"apps/var-app/dist",
    CLS_ICON:"icon-var",
    APP_NAME:"Value at Risk"
  },
  {
    APP_PAGE:"apps/swaps/dist",
    CLS_ICON:"icon-swaps",
    APP_NAME:"Swaps"
  }
]