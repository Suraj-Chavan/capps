import Vue from '@/ourVue.js';
import VueI18n from 'vue-i18n';
import messages from "../locales/default.json";

Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: 'default',
  fallbackLocale: 'default',
  messages
});


const loadedLanguages = ["default"]; // our default language that is preloaded

function setI18nLanguage (lang) {
  i18n.locale = lang;
  return lang;
}

export function loadLanguageAsync(lang, endPoint) {
  // If the same language
  if (i18n.locale === lang) {
    return Promise.resolve(setI18nLanguage(lang));
  }
  // If the language was already loaded
  if (loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18nLanguage(lang))
  }

  const vObj = {}; // Adjust the body object as needed
  // If the language hasn't been loaded yet
  return Vue.$credCAPI
      .collection(endPoint)
      .read({ body: vObj })
      .then((json) => {
        i18n.setLocaleMessage(lang, json[lang] || json);
        loadedLanguages.push(lang);
        return setI18nLanguage(lang);
      })
      .catch((error) => {
        console.log("Error occurred while loading the locale ", error);    
        return error;
      });
}
