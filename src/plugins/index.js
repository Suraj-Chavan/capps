import BaseRemoteSelect from "@/components/BaseComponents/Base-Remote-Select.vue";


/* GLOBALMIXIN */
import { Globalmixin } from "@/mixins"

/* DATASET */
// import dataset from "@/dataset.json";

/* DATEPICKER */
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

/* MODAL */
import ModalView from "@/components/ModalView";

/* FORM */
import { ValidationObserver } from "vee-validate";
import { ValidationProvider } from "vee-validate";
import "@/utils/veeValidateRules";
import FormElementWithValidation from "@/components/FormElementWithValidation";
import FilterView from "@/components/FilterView"

/*V-SELECT */
import "vue-select/dist/vue-select.css";
import vSelect from "vue-select";
import VSelectCustom from "@/components/VSelectCustom";
// To change `caret` and `close` icon
vSelect.props.components.default = () => ({
  Deselect: {
    render: createElement => createElement('span', { 
      domProps: {
        innerHTML: `
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="12" viewBox="0 0 11 12" fill="none">
            <path d="M0.485632 10.9387C0.714759 11.1678 1.08625 11.1678 1.31538 10.9387L10.363 1.89106C10.5921 1.66194 10.5921 1.29045 10.363 1.06132C10.1339 0.832192 9.76238 0.832191 9.53326 1.06132L0.485634 10.1089C0.256507 10.3381 0.256507 10.7096 0.485632 10.9387Z" fill="#738499" stroke="#738499" stroke-width="0.5"/>
            <path d="M9.53326 10.9387C9.76238 11.1678 10.1339 11.1678 10.363 10.9387C10.5921 10.7096 10.5921 10.3381 10.363 10.1089L1.31538 1.06132C1.08625 0.832191 0.714759 0.832192 0.485632 1.06132C0.256507 1.29045 0.256507 1.66193 0.485634 1.89106L9.53326 10.9387Z" fill="#738499" stroke="#738499" stroke-width="0.5"/>
          </svg>
        `
      }
    })
  },

  OpenIndicator: {
    render: createElement => createElement('span', {
      domProps: {
        innerHTML: `
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="10" viewBox="0 0 9 6" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.424316 1.20426C0.424316 1.33758 0.477559 1.46538 0.572216 1.55926L4.36222 5.34926C4.45295 5.44594 4.57963 5.50078 4.71222 5.50078C4.8448 5.50078 4.97148 5.44594 5.06222 5.34926L8.85222 1.55926C8.94687 1.46538 9.00011 1.33758 9.00011 1.20426C9.00011 1.07094 8.94687 0.943141 8.85222 0.849259L8.65222 0.649258C8.55814 0.5516 8.4278 0.497292 8.29222 0.499258H1.13222C0.99663 0.497292 0.866291 0.5516 0.772216 0.649258L0.572216 0.849259C0.477559 0.943141 0.424316 1.07094 0.424316 1.20426Z" fill="#738499" fill-opacity="0.8"/>
      </svg>
        `
      }
    }),
  },
});

/* DATE */
const dayjs = require('dayjs');
const Big = require('big.js');
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

/* DIRECTIVES */
import directives from "@/directives";

/* DIRECTIVES */
import Vue2Filters from "vue2-filters";
import filters from "@/filters";


/* Table*/
import TableGrid from "@/components/TableGrid";
import noData from "@/components/NoData";
import CardSkeleton from "@/components/CardSkeleton";
import ExpandedView from "@/components/ExpandedView";


/* --------------------------- Finish Importing ------------------------------ */

const components = {
  BaseRemoteSelect,
  DatePicker,
  ModalView,
  ValidationObserver,
  ValidationProvider,
  FormElementWithValidation,
  FilterView,
  vSelect,
  VSelectCustom,
  TableGrid,
  noData,
  CardSkeleton,
  ExpandedView
}

const _toString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;
function toDecimal(number, decimal) {
  var regExpr = /[^0-9.-]/g;
  number = parseFloat(("" + number).replace(regExpr, ''));
  return (number ? decimal == null ? number : parseFloat(number.toFixed(toDecimal(decimal, null))) : 0);
}
const rFunc = {
  hasOwn(obj, field) {
    return hasOwnProperty.call(obj, field);
  },
  isRefrence(obj) {
    return obj !== null && typeof obj === 'object'
  },
  isPlainArray(arr) {
    return _toString.call(arr) === '[object Array]'
  },
  isPlainObject(obj) {
    return _toString.call(obj) === '[object Object]'
  },
  isTrue(v) {
    return v === true
  },
  isFalse(v) {
    return v === false
  },
  isUndef(val) {
    return val === undefined || val === null
  },
  isNumber(val) {
    var pattern = /^\d+$/;
    return pattern.test(val)
  },
  toNumber(val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n
  },
  stringToNumber(val) {
    var n = val.replace(/[^0-9\.]+/g, '');
    return Number(n)
  },
  convertStringToNumber(number, decimal) {
    // var regExpr = /[^0-9.]/g;
    // if (typeof number == "number") number = number.toString();
    // if (typeof number == "string") number = number.replace(regExpr, "");
    var regExpr = /[^0-9.-]/g;
    number = parseFloat(("" + number).replace(regExpr, ''));
    return (number ? decimal == null ? number : parseFloat(number.toFixed(toDecimal(decimal, null))) : number == 0 ? 0 : number)
  },
  convertExponentialtoNumber(number) {
    return Number(new Big(number).toString());
  },
  convertCommaString(number) {
    var regExpr = /[^0-9.]/g;

    if (typeof number == "string")
      number = number.replace(regExpr, '')

    return number ? Number(number).toLocaleString() : "0";
  },
  toFixed(val, decimal) {
    var n = val.toString().replace(/[^0-9\.]+/g, '');
    return Number(n).toFixed(decimal)
  },
  isFalsyValue(v) {
    return !!v === false
  },
  currencySymbolToNumber(val) {
    if (!!val) {
      val = val + "";
      let multiplier = val.substr(-1).toLowerCase();
      if (multiplier == "k")
        return parseFloat(val) * 1000;
      else if (multiplier == "l")
        return parseFloat(val) * 100000;
      else if (multiplier == "c")
        return parseFloat(val) * 10000000;
      else if (multiplier == "b")
        return parseFloat(val) * 1000000000;
      else return val;
    }
  },
  today() {
    return dayjs().format(globalDateFormatShort)
  },
  currentTime() {
    return dayjs().format(globalTimeFormat)
  },
  formatDate(date) {
    const d = dayjs(date, globalDateFormatShort).format(globalDateFormatShort)
    return d
  },
  showNotificationSpinner(msg, zindx) {
    var elem = document.createElement('div');
    elem.setAttribute('id', 'notificationspinner');
    elem.innerHTML = `<div id="spinnercontainer" style='z-index: ${!!zindx ? zindx : 1}'><div class="spinnertext">
    <span class="spinner-loader"><i class="fa fa-spinner" aria-hidden="true"></i></span>${msg}</div>
    </div>`;
    document.body.appendChild(elem);
  },
  closeNotificationSpinner() {
    var elem = document.getElementById("notificationspinner");
    elem.remove();
  },
}


const Plugin = {
  install(Vue, store) {

    Vue.directive('sticky-columns', {
      inserted(el) {
        const calculateStickyPositions = () => {
          const stickyColumns = el.querySelectorAll('.b-table-sticky-column');
          
          stickyColumns.forEach(column => {
            let leftOffset = 0;
            column.style.left = `${leftOffset}px`;
            leftOffset += column.offsetWidth;
          });
        };
    
        // Initial calculation
        calculateStickyPositions();
    
        // Add event listeners to handle scrolling and resizing
        el.addEventListener('resize', calculateStickyPositions);
        el.addEventListener('scroll', calculateStickyPositions);
    
        // Clean up event listeners when directive is unbound
        el._onResizeScroll = calculateStickyPositions;
      },
      unbind(el) {
        el.removeEventListener('resize', el._onResizeScroll);
        el.removeEventListener('scroll', el._onResizeScroll);
      }
    });
    
    

    // GLOBAL MIXIN
    Vue.mixin(Globalmixin);
    Vue.use(Vue2Filters);

    /* COMPONENTS */
    Object.keys(components).forEach((key) => {
      Vue.component(key, components[key])
    });

    /* DIRECTIVE */
    Object.keys(directives).forEach((key) => {
      Vue.directive(key, directives[key])
    });

    /* UTILITY FUNCITONS */
    Object.keys(rFunc).forEach(key => {
      Vue.prototype[`$${key}`] = rFunc[key]
    })
    /* PROTOTYPE */
    // Vue.prototype.$dataset = dataset;
    Vue.prototype.$config = Vue['$config'] = window.config || {};
    Vue.prototype.$dayjs = Vue['$dayjs'] = dayjs;

    /* FILTERS */
    /*Object.keys(filters).forEach(key => {
      Vue.filter[key] = filters[key]
    })*/
    for (let name in filters) {
      Vue.filter(name, filters[name]);
    }


  }
}

export default Plugin