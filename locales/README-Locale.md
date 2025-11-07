# App Boiler Plate

```js
npm i vue-i18n
```


# Configuration in 
`vue.config.js`
```js
   pluginOptions: {
      i18n: {
        locale: 'en',
        fallbackLocale: 'en',
        localeDir: 'locales',
        enableInSFC: false
      }
  }
```

# Configuration in 
`src\main.js`
```js
import { i18n, loadLanguageAsync } from './i18n';
router.beforeEach((to, from, next) => {
  const lang = config.applanguage
  loadLanguageAsync(lang).then(() => next())
});
new Vue({
  i18n, // i18n Inits
  router: router,
  store: store,
  render: (h) => h(App),
}).$mount("#app");

```

# Configuration in 
`src\i18n.js`

```js
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from "../locales/en.json";

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages
})


const loadedLanguages = ["en"] // our default language that is preloaded

function setI18nLanguage (lang) {
  i18n.locale = lang
  return lang
}

export function loadLanguageAsync(lang) {
  // If the same language
  if (i18n.locale === lang) {
    return Promise.resolve(setI18nLanguage(lang))
  }
  // If the language was already loaded
  if (loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18nLanguage(lang))
  }
  // If the language hasn't been loaded yet
  return fetch(`../locales/${lang}.json`)
  .then(r => r.json())
  .then(json => {
    i18n.setLocaleMessage(lang, json[lang] || json)
    loadedLanguages.push(lang)
    return setI18nLanguage(lang)
  },response => {
    console.log("Error occured while loading the locale ",response)
    return response
  });
}
```

# JSOn file for Locale
`locales\en.json`
{
  "en": {
    "app":{
      "nav_title":"ETF"
    }
  }
}

# How to use
```vue
{{ $t("transactions_details.investment_cart.$header") }}
```