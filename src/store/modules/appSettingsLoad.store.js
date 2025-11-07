import { readAppSettings } from "@/app_settings"

const initialState = () => ({
    APP_SETTINGS: {},
});

const state = initialState();

// Getters
const getters = {
    getAppSettings: (state) => async (groupCollectionKey, configKey) => {
        const APP_SETTINGS = await (state.APP_SETTINGS);
        if (groupCollectionKey && configKey)
            return (APP_SETTINGS[groupCollectionKey] || {})[configKey] || null;
        if (groupCollectionKey && !configKey)
            return APP_SETTINGS[groupCollectionKey] || null;
        return APP_SETTINGS;
    }
};

/**
 * Actions
 */
const actions = {
    reset({ commit }) {
        commit('RESET');
    },
    async getSettingsFromServer({ commit }) {
        commit("SET_APP_SETTINGS", await readAppSettings());
    },
}

/**
 * Mutations
*/
const mutations = {
    RESET(state) {
        const newState = initialState();
        Object.keys(newState).forEach(key => {
            state[key] = newState[key]
        });
    },
    SET_APP_SETTINGS(state, settings) {
        state.APP_SETTINGS = settings;
    },
    CHANGE_FAVORITE_SETTING(state, { ID, isFavorite, APP_NAME }) {
        state.APP_SETTINGS = state.APP_SETTINGS || { [APP_NAME]: { fav: {}, recent: {} } };
        state.APP_SETTINGS[APP_NAME] = state.APP_SETTINGS[APP_NAME] || { fav: {}, recent: {} };
  
        state.APP_SETTINGS[APP_NAME].fav = state.APP_SETTINGS[APP_NAME].fav || {};
        if(isFavorite === true) state.APP_SETTINGS[APP_NAME].fav[ID] = true;
        else delete state.APP_SETTINGS[APP_NAME].fav[ID];
  
        const SHALLOW_COPY = state.APP_SETTINGS;
        state.APP_SETTINGS = null;
        state.APP_SETTINGS = SHALLOW_COPY;
      },
}



export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
