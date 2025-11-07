const utility = {

    convertToNumber(number, configs) {
        var regExpr = /[^0-9.-]/g;
        number = number.toString()
        number = number.replace(regExpr, '')
        if (number.length > 1 && !configs.preventCommaSeparation) number = number.replace(/^0+/, '');
        return number
    },

    formatPrice(value, comma, period, configs) {
        value = value || "";
        comma = comma || ',';
        period = period || '.';
        let num = this.unFormatPrice(value);
        num = this.amountPostfix(num);
        let split = num.toString().split('.');
        let numeric = this.convertToNumber(split[0], configs);
        let decimal = split.length > 1 ? period + split[1] : '';
        if (configs.preventCommaSeparation === true)
            return configs.preventDecimal === true ? numeric : numeric + decimal;

        let reg = /(\d+)(\d{3})/;
        while (reg.test(numeric)) {
            numeric = numeric.replace(reg, '$1' + comma + '$2');
        }

        return configs.preventDecimal === true ? numeric : numeric + decimal;
    },

    amountPostfix(vamount) {
        let numObj = { "K": 1000, "M": 1000000, "B": 1000000000 }
        let arr = vamount.match(/[M,B,K]{1}$/i)
        if (arr == null) return vamount;
        else {
            vamount = vamount.match(/^(\d*\.)?\d*/)[0];
            vamount = vamount * numObj[arr[0].toUpperCase()]
        }
        return vamount;
    },

    unFormatPrice(num) {
        let numeric = num.toString()
        numeric = numeric.replace(/,/g, '');
        return numeric;
    }
}

function addNumberMask(el, binding) {
    if (!el) return;
    var configs = binding.value || {};
    configs.preventDecimal = configs.preventDecimal === true;
    configs.preventCommaSeparation = configs.preventCommaSeparation === true;
    configs.allowNegative = configs.allowNegative === true;

    el.keyupListener = function (e) {
        el.value = utility.formatPrice(e.target.value, ',', '.', configs);
        el.dispatchEvent(new Event('input'))
    };
    el.blurListener = function (e) {
        e.stopPropagation()
        el.value = utility.unFormatPrice(e.target.value, configs);
        el.dispatchEvent(new Event('input'))
    };
    el.focusListener = function (e) {
        el.value = utility.formatPrice(e.target.value, ',', '.', configs);
    };
    el.onkeypressListener = function (e) {
        if ((configs.preventDecimal === true && e.charCode == 46)) {
            e.preventDefault()
        }
        // Allow negative sign only at the 0th index
        if ((configs.allowNegative === true && e.charCode == 45)) {
            if (el.selectionStart !== 0 || el.value.includes('-')) {
                e.preventDefault();
            }
            return;
        }
        if ([46, 8, 9, 27, 13, 190].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A
            (e.keyCode === 65 && e.ctrlKey === true) ||
            // Allow: Ctrl+C
            (e.keyCode === 67 && e.ctrlKey === true) ||
            // Allow: Ctrl+X
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39) ||
            // Allow M B K Chareactor
            e.keyCode == 107 || e.keyCode == 75 || e.keyCode == 98 || e.keyCode == 66 || e.keyCode == 109 || e.keyCode == 77) {
            // let it happen, don't do anything
            return
        }
        // Ensure that it is a number and stop the keypress
        if (e.keyCode <= 44 || e.keyCode > 57 || e.keyCode == 45 || e.keyCode == 47) {
            e.preventDefault()
        }
    };
    el.addEventListener('focus', el.focusListener);
    el.addEventListener('keypress', el.onkeypressListener);
    el.addEventListener('keyup', el.keyupListener);
    el.addEventListener('blur', el.blurListener, true);
}

function removeAllEventListeners(el) {
    el.removeEventListener('focus', el.focusListener);
    el.removeEventListener('keypress', el.onkeypressListener);
    el.removeEventListener('keyup', el.keyupListener);
    el.removeEventListener('blur', el.blurListener);
}

export default {
    bind: addNumberMask,
    unbind: removeAllEventListeners
}