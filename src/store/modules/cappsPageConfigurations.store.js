

const initialState = () => ({
    homePage: "",
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
    setHomePage({ commit }, homePage) {
        commit("SET_HOME_PAGE", homePage);
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
    SET_HOME_PAGE(state, homePage) {
       state.homePage = homePage;
    },
}



export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
