# ✨ CAPPs Overview 📘

### 🛠️ **Introduction**
Credence App Server (**CAPPs**) is an indigenous framework designed to streamline application development and deployment.

---

## 📂 Folder Structure 📁

```plaintext
.
└── credence/
    └── apps/
        ├── my_awesome_app/
        │   ├── rest/
        │   │   └── collection/
        │   │       └── awesome_collection/
        │   │           ├── schema.json
        │   │           └── controller.js
        │   ├── event-hooks/
        │   │   └── awesome-collection/
        │   │       └── controller.js
        │   ├── pages/
        │   │   ├── my_awesome_page
        │   │   └── my_awesome_report
        │   ├── plugins/
        │   │   └── <product>.js
        │   ├── en.json
        │   └── config.json
        └── ui/
            ├── capps
            ├── page-builder
            └── app-components
```

---

### 🔗 **Dependencies**
- 🔧 **NREST**
- ⚙️ **NCONSUMER**
- 🌐 **NGINX**

---

## 🗂️ **Microservices Folder Structure**
```plaintext
.
└── credence/
    └── microservices/
        ├── NREST/
        │   ├── servicemanager
        │   ├── pagebuilder
        │   ├── <servicefolder>/
        │   │   └── dbconfig.json
        │   └── index.js
        └── NODDECONSUMER/
            ├── consumermanager
            └── Handlers/
                └── config.json
```

---

## 🚀 Quick Installation Guide

### 📥 **Repositories to Clone**
Clone the following repos into their designated folders:

- **UI Components**: [credence/ui/capps](https://gitlab.credenceanalytics.com/frameworks-and-tools/capps/-/tree/development)
- **Service Manager**: [credence/microservices/NREST/servicemanager](https://gitlab.credenceanalytics.com/frameworks-and-tools/servicemanager/-/tree/feature-rest-api-newstructure)
- **Consumer Manager**: [credence/microservices/NODECONSUMER/consumermanager](https://gitlab.credenceanalytics.com/frameworks-and-tools/consumermanager/-/tree/feature-event-hooks)
- **Page Builder**: [credence/ui/page-builder](https://gitlab.credenceanalytics.com/frameworks-and-tools/page-builder/-/tree/development?ref_type=heads)
- **REST Page Builder**: [credence/microservices/NREST/pagebuilder](https://gitlab.credenceanalytics.com/frameworks-and-tools/pagebuilder-rest/-/tree/feature-credbooks)
- **App Components**: [credence/ui/app-components](https://gitlab.credenceanalytics.com/iwf/app-component/-/tree/feature-capps-page-intpps-page-integration%23slc)

---

### ⚙️ **Configurations to Add**

**NREST Service Manager (`dbconfig.json`)**:
```json
"APPS_DIR_PATH": "/path/to/credence/apps",
"GATEWAY_ROUTES": {
    "nrest": "/NREST",
    "nconsumer": "/funds_sc",
    "ncenter": "/nc"
  },
  "PRODUCT_CODE": "FUNDS"
```

**NODECONSUMER Handlers (`config.json`)**:
```json
"CONSUMER_APPS_PATH": "/path/to/credence/apps",
"GATEWAY_ROUTES": {
    "nrest": "/NREST",
    "nconsumer": "/funds_sc",
    "ncenter": "/nc"
  },
  "PRODUCT_CODE": "FUNDS"
```

**NGINX Configuration (`nginx.conf`)**:
```bash
location /capps/ 
{
    alias /path/to/credence/apps/ui/capps/;
    autoindex off;
    # expires 365d; # Expires header with a date 365 days in the future
}

location ~ ^/capps/([^/]+)/public/(.*)$ 
{
    set $appname $1;
    set $filepath $2;
    root D:/credence/Servers/Funds/Apps;
    try_files /$appname/public/$filepath =404;
}

```
**CAPPS Configuration (`config.js`)**:   
- Change values of following configurations as per the product
```js
config.NREST = "/funds_sc"; //NREST
config.globalDateFormatLong = "DD-MM-YYYY hh24:mi:ss";
config.globalDateFormatShort = "DD-MM-YYYY"
config.remoteApplicationDetails.remoteApp1.appName="app_components"
config.remoteApplicationDetails.remoteApp1.remoteURL="/STD/Apps/app-components/dist/remoteEntry.js",// URL of remote
config.remoteApplicationDetails.remoteApp2.appName="page_builder"
config.remoteApplicationDetails.remoteApp2.remoteURL="/STD/Apps/page-builder/dist/remoteEntry.js",// URL of remote

```
- Update session configuration using `config.getSessionStorage`
- Update signout configuration using `config.signOutConfiguration`
- Update change password configuration using `config.changePwdConfiguration`
---

### 🛠️ **Code Modifications**

Update **NREST `index.js`**:
```javascript
initPageBuilder({
    "app": servicemgr.app,
    "pages_dir": path.join(__dirname, "pages"),
    "pool": DB,
    "app_path": config.APPS_DIR_PATH
});
```

---

### 📦 **Library Installation**

**Install in `NREST`:**
```bash
npm install @frameworks-and-tools/rest-service-adapter@1.0.0
npm install @frameworks-and-tools/dbutils@1.0.3
```

**Install in `NODECONSUMER`:**
```bash
npm install @frameworks-and-tools/rest-service-adapter@1.0.0
npm install @frameworks-and-tools/dbutils@1.0.3
```

---

🎉 **You're all set!**

## Further Reading

- [How to Create New App](./How%20to%20create%20a%20new%20App.md) ?
- [How to Add User Defined Actions](./CAPPS%20APIS.md#capps-apis) ?
- [CAPPs Layout Documentation](./capps%20layout%20documentation.md#layout-structure)
- [CAPPs Custom Form Documentation](./capps_custom_add_modify_screen.md#virtual-collection-custom-addmodify-screen)

---
[Go back to main page](../README.md)