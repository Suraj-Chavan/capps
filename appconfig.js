/* eslint-disable no-undef */
console.log("started");
const fs = require("fs");
const path = require("path");

const getDirectories = function(path) {
  return fs.readdirSync(path).filter(function(file) {
    return fs.statSync(path + "/" + file).isDirectory();
  });
};

const resolveComponentPath = (moduleName, viewName, compName) => {
  if (compName.indexOf("/") >= 0) {
    return path.normalize(path
      .resolve("modules", moduleName || '', viewName || '',  compName))
      .replace(__dirname, "@")
      .replace(/\\/g, '/')
  } else {
    return path.normalize(path
      .resolve("modules", moduleName || '', viewName || '', compName))
      .replace(__dirname, "@")
      .replace(/\\/g, '/')
  }
};
const loadSettings = () => {
  var modules = getDirectories("./src/modules/");
  var appSettings = {};
  var componentlist = {};
  var approutes = [];

  appSettings.details = fs.existsSync("./settings.json")
    ? require("./settings.json")
    : {};
  appSettings.modules = {};

  modules.forEach((module) => {
    let settingsfile = path.resolve("./src/modules/", module, "settings.json");
    var moduleSettings = {};
    var moduleRoute;
    if (fs.existsSync(settingsfile)) {
      moduleSettings = require(settingsfile);

      if (!appSettings.details.home) appSettings.details.home = module;

      if (!moduleRoute) {
        moduleRoute = {
          path: "/" + module,
          component: moduleSettings.component || {
            template: `<div><router-view></router-view></div>`,
          },
          meta: moduleSettings.meta || null,
        };
      }

      if (typeof moduleRoute.component == "string") {
        componentlist[
          "./" + module + "/" + moduleRoute.component
        ] = {module : module, compname : resolveComponentPath(module, null, moduleRoute.component)};
        
        moduleRoute.component = "./" + module + "/" + moduleRoute.component;
      }
      if (!moduleRoute.path) {
        moduleRoute.path = "/" + module;
      }
    } else {
      moduleSettings = {
        caption: module,
      };
      moduleRoute = {
        path: "/" + module,
        component: {
          template: `<div> <router-view></router-view> </div>`,
        },
      };
    }
    if (!moduleRoute.meta) moduleRoute.meta = {};
    moduleRoute.meta.module = module;

    appSettings["modules"][module] = moduleSettings;
    appSettings["modules"][module]["views"] = {};
    var views = getDirectories(path.resolve("./src/modules/", module));
    views.forEach((view) => {
      var viewroutes;
      var viewsettings = {};
      let viewsettingsfile = path.resolve(
        "./src/modules/",
        module,
        view,
        "settings.json"
      );
      if (fs.existsSync(viewsettingsfile)) {
        viewsettings = require(viewsettingsfile);
        var routes = viewsettings.routes || [];
        delete viewsettings.routes;

        if (!moduleSettings.home) moduleSettings.home = view;

        appSettings["modules"][module]["views"][view] = viewsettings;
        viewroutes = {
          path: view,
          component: viewsettings.component ? ("./" + module + "/" + view + "/" + viewsettings.component) : "" || {
            template: `<div> <router-view></router-view> </div>`,
          },
        };

        if (viewsettings.meta) viewroutes.meta = viewsettings.meta;


        function getChildrenRoutes(routes) {
          routes.forEach((route) => {
            if (!route.component) console.log(module + "-" + view + "-" + route.path + ": View settings incomplete. No component defined !");
            if (typeof route.component == "string") {
              componentlist[
                "./" + module + "/" + view + "/" + route.component
              ] = {module : module, compname :resolveComponentPath(module, view,  route.component)};
              route.component =
                "./" + module + "/" + view + "/" + route.component;
            }
            if(route.routes) getChildrenRoutes(route.routes);
          });
          if (routes) {
            if (!viewroutes.children) viewroutes.children = [];
            viewroutes.children = viewroutes.children.concat(routes);
            if (!viewroutes.meta) viewroutes.meta = {};
            viewroutes.meta.view = view;
          }
        }

        getChildrenRoutes(routes);
      }
      if (viewroutes) {
        if (!moduleRoute.children) moduleRoute.children = [];
        moduleRoute.children.push(viewroutes);
        if (moduleSettings.home == view) {
          moduleRoute.children.push({
            path: ``,
            redirect: `/${module}/${view}`,
          });
        }
      }
    });
    approutes.push(moduleRoute);
  });
  approutes.push({ path: "/", redirect: "/" + appSettings.details.home });

  var filecode = [];
  filecode.push("var componentlist = {}");
  Object.keys(componentlist).forEach((compname) => {
    let variablename = compname.replace(/\./gi, "_").replace(/\//gi, "_");
    filecode.push(`var ${variablename} = ()=> import(/* webpackChunkName: "${componentlist[compname]['module']}" */ '${componentlist[compname]['compname']}')`);
    filecode.push(`componentlist['${compname}'] = ${variablename}`);
  });

  const sortbyOrder = function(tempObject) {
    let keys = Object.keys(tempObject);
    keys.sort(
      (a, b) => (tempObject[a]["order"] || 99) - (tempObject[b]["order"] || 99)
    );
    var result = {};
    keys.forEach((element) => {
      result[element] = tempObject[element];
    });
    return result;
  };

  var tempmodules = appSettings.modules;
  Object.keys(tempmodules).forEach((key) => {
    let tempviews = tempmodules[key]["views"];
    if (tempviews) {
      tempmodules[key]["views"] = sortbyOrder(tempviews);
    }
  });
  appSettings.modules = sortbyOrder(tempmodules);

  filecode.push(" var settings = " + JSON.stringify(appSettings, null, 4));

  filecode.push(" var routes = " + JSON.stringify(approutes, null, 4));
  filecode.push(" export {routes, settings, componentlist}");

  fs.writeFileSync(
    path.resolve("./src", "appsettings.js"),
    filecode.join("\n")
  );
};

loadSettings();
