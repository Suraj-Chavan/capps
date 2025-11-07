

const initialState = () => ({
    moduleName: "CAPPS",
    moduleConfigurations: {}
});

const state = initialState();

// Getters
const getters = {};

/**
 * Actions
 */
const actions = {
    reset({ commit }) {
        commit('RESET');
    },
    setModuleName({ commit }, moduleName) {
        commit("SET_MODULE_NAME", moduleName);
    },
    setModuleConfigurationData({ commit}, moduleData) {
        commit("SET_MODULE_CONFIGURATIONS", moduleData);
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
    SET_MODULE_NAME(state, moduleName) {
       state.moduleName = moduleName;
    },
    SET_MODULE_CONFIGURATIONS(state, moduleData) {
        state.moduleConfigurations = moduleData;
    }
}



export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
