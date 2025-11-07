

const initialState = () => ({
    checkedItem: {},
    checkedItemState: {},
    checkedItemList: []
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
    selectItem({ commit }, payload) {
        if(payload.checked == null) return console.error("`checked` key is mandatory and may contain true or false as value");
        if(payload.checked === true && !payload.primaryKey || !payload.item) {
            return console.error("If checkbox state is true, then to select a record from grid primaryKey and item keys are required");
        }
        commit("SELECT_ITEM", payload);
        commit("SET_CHECKED_ITEM_LIST")
    },
    selectRecords({ dispatch }, payload) {
        if(payload == null || !Array.isArray(payload) || payload.length == 0) return;
        payload.map(function(item) {
            dispatch("selectItem", {
                checked: true, 
                item,
                primaryKey: 'SR_NO_' + item.SR_NO,
            })
        });
    }
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
    SELECT_ITEM(state, { primaryKey, item, checked }) {
        state.checkedItemState = Object.assign({}, state.checkedItemState, { [primaryKey]: checked });
        if(checked) return state.checkedItem = Object.assign(state.checkedItem, { [primaryKey]: item });
        delete state.checkedItem[primaryKey];
    },
    SET_CHECKED_ITEM_LIST(state) {
        state.checkedItemList = Object.values(state.checkedItem);
    },
    OnCheckedItem(state, val) {
        if (val) {
            state.checkedItemList = val;
        }
        else {
            state.checkedItemList = [];
            state.checkedItemList.length = 0;
        }
    }
}



export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
