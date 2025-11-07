import Vue from '@/ourVue.js';
import Vuex from 'vuex';
import modules from './modules';
import createLogger from 'vuex/dist/logger';

const debug = process.env.NODE_ENV !== 'production';

Vue.use(Vuex);

export default new Vuex.Store({
  modules,
  strict: false,
  plugins: debug ? [createLogger()] : [],
  state: {
    refCount: 0,
    isLoading: false,
    isActionPerformed: false,
    validationErrors: [],
    selectedFilters: [],
  },
  mutations: {
    loading(state, isLoading) {
      if (isLoading) {
        state.refCount++;
        state.isLoading = true;
      } else if (state.refCount > 0) {
        state.refCount--;
        state.isLoading = (state.refCount > 0);
      }
    },
    OnActionPerformed(state, isActionPerformed) {
      if (isActionPerformed) {
        state.isActionPerformed = true;
      }
      else {
        state.isActionPerformed = false;
      }
    },
    OnValidationErrors(state, val) {
      if (val) {
        state.validationErrors = val;
      }
      else {
        state.validationErrors = [];
      }
    },
    OnSelectedFilters(state, val) {
      if (val[0]) {
        state.selectedFilters = val;
      }
      else {
        state.selectedFilters = [];
      }
    },
  },
  actions: {},
  getters: {}
})
