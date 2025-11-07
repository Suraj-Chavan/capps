var config = {}

config.baseURL = '/';
config.jsonserver = false;
config.JREST = "/JREST"; //JREST
config.NREST = "/NREST"; //NREST
config.PYTHON = "/JREST";
config.NSERVER = true; // NOTIFICATIONS
config.MEGAMENU = true;
config.MACRO = true;
config.CARD_VIEW = false;
config.globalDateFormatLong = "DD-MM-YYYY hh:mm:ss";
config.globalDateFormatShort = "DD-MM-YYYY"
config.globalTimeFormat = "hh:mm:ss";
config.applanguage = "en";



config.fillDummyData = false


config.amtdecimal = 4;

config.settlementDays = '2';

// micro frontend

config.remoteApplicationDetails = {
    remoteApp1: {
        appName: "app_components", // Remote federated app name
        remoteURL: "/mercury5_tc/Framewrk/app-components/dist/remoteEntry.js", // URL of remote federated application
        federatedModules: {
            // Exposed modules of remote application.
            Macro: "./Macro",
            FileUpload: "./FileUpload",
            HeaderBar: "./MercuryHeaderComponent",
            DashboardRouterWrapper: "./DashboardRouterWrapper",
        }
    },
    remoteApp2: {
      appName: "page_builder", // Remote federated app name
      remoteURL: "/mercury5_tc/Framewrk/page-builder/dist/remoteEntry.js", // URL of remote federated application
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

config.getSessionStorage = () => ({
    ...sessionStorage,
    userid: sessionStorage.getItem("_userid"),
    user_name: sessionStorage.getItem("_user_name"),
    sessionid: sessionStorage.getItem("_ticket"),
    roles: function () {
      // RoleIDs should be returned as an array by this function.
      const roles = new Function("return " + (sessionStorage.getItem("roles") || "[]"))();
      return roles.map(item => item.role);
    }
  });

  config.signOutConfiguration = {
    api: "/Framewrk/Home.jsp",
    body: new URLSearchParams({ m: '_V00', v: '_V00', event: "onlogout", sessionid: sessionStorage.getItem("_ticket") }).toString(),
    afterSignOutAction(response) {
        response = response || { status: response == null ? "recheck" : "unsuccess" };
        const _this = this;
        if(response.status === "recheck") {
          _this.$store.commit("loading", true);
          _this.$credCAPI
              .collection(`MODULE_NAME/config`)
              .read({ body: {} })
              .then((response) => {
                _this.$store.commit("loading", false);
                if(response.message.includes("Invalid Session for id")) {
                  _this.$_showAlert("Logout Successful", (response.msg || response.error || "You have been successfully logged out. You will be redirected shortly."));
                  setTimeout(() => {
                    sessionStorage.clear();
                    location.href = "/";
                  }, 1);
                  return;
                }
                _this.$_showAlert("Logout Unsuccessful", response.error || response.msg || "There was an issue logging you out. Please try again.");
              })
              .catch((response) => {
                _this.$store.commit("loading", false);
                _this.$_showAlert("Logout Unsuccessful", response.error || response.msg || "There was an issue logging you out. Please try again.");
              });
        }
    }
};
  
config.changePwdConfiguration = {};
config.productName = "Mudra 2.0";


config.appList = [
  {
    APP_PAGE: "custom-dashboard/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME: "User Management"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON:"mercury-icon2",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon3",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon4",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon5",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  },
  {
    APP_PAGE:"exception-view/dist",
    CLS_ICON: "mercury-icon1",
    APP_NAME:"Module Name"
  }
]