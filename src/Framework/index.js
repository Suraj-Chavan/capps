window.capps = window.capps || {};

import Vue from "vue";
import * as capps from "./capps";
import injectDependencies from './utility/DEPENDENCIES_INHERITANCE';


window.capps = Vue.capps = Vue.prototype.capps = { ...capps };
window.current_form = null;

injectDependencies(window.capps);

export default window.capps;