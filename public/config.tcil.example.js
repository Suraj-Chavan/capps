var config = {}

config.baseURL = '/';
config.jsonserver = false;
config.JREST = "/JREST"; //JREST
config.NREST = "/corporate/NREST"; //NREST
config.PYTHON = "/JREST";
config.NSERVER = true; // NOTIFICATIONS
config.MEGAMENU = true;
config.MACRO = true;
config.CARD_VIEW = false;
config.NCollection = 'returns'; // NOTIFICATIONS ROOM
config.globalDateFormatLong = "DD-MM-YYYY HH:mm:ss";
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
        remoteURL: "/corporate/apps/appcomponents/dist/remoteEntry.js", // URL of remote federated application
        federatedModules: {
            // Exposed modules of remote application.
            Macro: "./Macro",
            FileUpload: "./FileUpload",
            HeaderBar: "./TCILHeaderComponent",
            DashboardRouterWrapper: "./DashboardRouterWrapper",
        }
    },
    remoteApp2: {
      appName: "page_builder", // Remote federated app name
      remoteURL: "/corporate/apps/page-builder/dist/remoteEntry.js", // URL of remote federated application
        federatedModules: {
            // Exposed modules of remote application.
            PageDisplay: "./PageDisplay",
            PageBuilderStore: "./PageBuilderStore"
        }
    },
    remoteApp3: {
      appName: "capps_vue3_package",
      remoteURL: "/corporate/capps/dist__vue3-mfe/capps_vue3_package.js", //  URL of remote federated application
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
    api: "/corporate/app/logout",
    body: new URLSearchParams({ m: '_V00', v: '_V00', event: "onlogout", sessionid: sessionStorage.getItem("_ticket") }).toString(),
    afterSignOutAction(response) {
        response = response || {};
        const _this = this;
        (async function() {
          if (response.status != "success") return _this.$_showAlert("Logout Unsuccessful", response.error || response.msg || "There was an issue logging you out. Please try again.");
          await _this.$_showAlert("Logout Successful", (response.msg || response.error || "You have been successfully logged out. You will be redirected shortly."));
          sessionStorage.clear();
          location.href = "/corporate/landingpage";
        })();
    
    }
};

config.changePwdConfiguration = {
  chgSave() {
      // const _this = this;
      let isFormFilled = true;
      let fieldsData = [
        {
          field: "oldPassword",
          label: "Old Password",
        },
        {
          field: "newPassword",
          label: "New Password",
        },
        {
          field: "confirmPassword",
          label: "Confirm Password",
        },
      ];
      let manadatoryFields = [];
      fieldsData.map((item) => {
        if (!this[item.field]) {
          isFormFilled = false;
          manadatoryFields.push(item.label + ": " + "Mandatory Field <br>");
        }
      });
      if (!isFormFilled) {
        return this.$_showAlert("Alert", manadatoryFields.join(" "));
      }
      
      this.$store.commit("loading", true);
      
      var validationStatus = this.validatePwdComposition(
        this.newPassword,
        this.user_id
      );
      if (validationStatus.status == "unsuccess") {
          this.$store.commit("loading", false);
          this.$_showAlert("Alert", validationStatus.error);
        return false;
      }

      
      let data = { "NEW_PASSWORD": this.hashAllPwdField(this.newPassword), "OLD_PASSWORD": this.hashAllPwdField(this.oldPassword) };
      this.$store.commit("loading", true);
      this.$credCAPI
        .collection(`cids/user/update/password/${this.user_id}`)
        .read({ body: {data:data} })
        .then((response) => {
            this.$store.commit("loading", false);
            if (response.status != "success") {
              this.$_showAlert("Alert", response.error);
              this.oldPassword = "";
              this.newPassword = "";
              this.confirmPassword = "";
              this.$store.commit("loading", false);
              return false;
            }
            location.href="/corporate/landingpage"
        })
        .catch((error) => {
          this.$store.commit(" ", false)
          this.$_showAlert("Alert", `${error}`);
        })
        
    },
}
config.productName = "Mudra Corporate App";
config.appname = "cids_app";
config.NCENTER = "/corporate/ncenter";
config.socketPath = "/corporate_nc";