
const initialState = (keysToReset) => {
    const _STATE_ = ({
        collectionName: "",
        collectionSchemaDetails: {},
    });
    if (!keysToReset || keysToReset.length === 0) return _STATE_;
    return keysToReset.reduce(function (acc, key) {
        acc[key] = _STATE_[key];
        return acc;
    }, {});
};


const loadedCollectionSchemaDetails = {};

const state = initialState();

// Getters
const getters = {};

/**
 * Actions
 */
const actions = {
    reset({ commit }, keysToReset) {
        commit('RESET', keysToReset);
    },
    setCollectionName({ commit }, collectionName) {
        commit("SET_COLLECTION_NAME", collectionName);
    },
    getCollectionSchemaDetails({ commit, state }, {
        collectionName,
        moduleName,
    }) {  
        let capps = window.capps;

        if (loadedCollectionSchemaDetails[collectionName]) {
            if(state.collectionSchemaDetails.$collectionName === collectionName) return loadedCollectionSchemaDetails[collectionName];
            
            loadedCollectionSchemaDetails[collectionName].then((response) => {
                commit("SET_COLLECTION_SCHEMA_DETAILS", response);
            });

            return loadedCollectionSchemaDetails[collectionName];
        }

        loadedCollectionSchemaDetails[collectionName] = capps.rest[moduleName][collectionName].schema({})
            .then((response) => {
                if (response.status === "unsuccess" || Object.keys(response).length === 0) throw new Error("Invalid response");
                response.$collectionName = collectionName;
                commit("SET_COLLECTION_SCHEMA_DETAILS", response);
                return response;
            })
            .catch((error) => {
                console.error("Error occured while fetching collection schema", error);
                const response = { status: "unsuccess", msg: `Invalid collection ${collectionName}` }
                commit("SET_COLLECTION_SCHEMA_DETAILS", response);
                return response;
            });

        return loadedCollectionSchemaDetails[collectionName];
    },
}

/**
 * Mutations
*/
const mutations = {
    RESET(state, keysToReset) {
        const newState = initialState(keysToReset);
        Object.keys(newState).forEach(key => {
            state[key] = newState[key]
        });
    },
    SET_COLLECTION_NAME(state, collectionName) {
        state.collectionName = collectionName;
    },
    SET_COLLECTION_SCHEMA_DETAILS(state, collectionSchemaDetails) {
        state.collectionSchemaDetails = collectionSchemaDetails;
    }
}



export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
