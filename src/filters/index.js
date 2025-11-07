function unformatPrice(numeric) {
    numeric = numeric.toString()
    numeric = numeric.replace(/\,/g, '');
    return numeric;
};

function formatePrice(num, comma, period) {
    comma = comma || ',';
    period = period || '.';
    var split = num.toString().split('.');
    var numeric = split[0];
    var decimal = split.length > 1 ? period + split[1] : '';
    numeric = numeric.replace(/\,/g, '');
    var reg = /(\d+)(\d{3})/;
    while (reg.test(numeric))
        numeric = numeric.replace(reg, '$1' + comma + '$2');
    return numeric + decimal;
};

function toDecimal(number, decimal) {
    var regExpr = /[^0-9.-]/g;
    number = parseFloat(("" + number).replace(regExpr, ''));
    return (number ? decimal == null ? number : parseFloat(number.toFixed(toDecimal(decimal, null))) : 0);
};

export default {
    convertCommaString(number, decimal = config.amtdecimal) {
        return formatePrice(toDecimal(number, decimal));
    },
    convertStringToNumber(number, decimal) {
        return parseFloat(unformatPrice(toDecimal(number, decimal)));
    },
    capitalize(s) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    },
    convertNumbersIntoWords(num) {
        if (!!num) {
            // System for American Numbering 
            var th_val = ['', 'thousand', 'crore', 'billion', 'trillion'];
            // System for uncomment this line for Number of English 
            // var th_val = ['','thousand','million', 'milliard','billion'];

            var dg_val = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
            var tn_val = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
            var tw_val = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
            let s = num;
            s = s.toString();
            s = s.replace(/[\, ]/g, '');
            if (s != parseFloat(s))
                return 'not a number ';
            var x_val = s.indexOf('.');
            if (x_val == -1)
                x_val = s.length;
            if (x_val > 15)
                return 'too big';
            var n_val = s.split('');
            var str_val = '';
            var sk_val = 0;
            for (var i = 0; i < x_val; i++) {
                if ((x_val - i) % 3 == 2) {
                    if (n_val[i] == '1') {
                        str_val += tn_val[Number(n_val[i + 1])] + ' ';
                        i++;
                        sk_val = 1;
                    } else if (n_val[i] != 0) {
                        str_val += tw_val[n_val[i] - 2] + ' ';
                        sk_val = 1;
                    }
                } else if (n_val[i] != 0) {
                    str_val += dg_val[n_val[i]] + ' ';
                    if ((x_val - i) % 3 == 0)
                        str_val += 'hundred ';
                    sk_val = 1;
                }
                if ((x_val - i) % 3 == 1) {
                    if (sk_val)
                        str_val += th_val[(x_val - i - 1) / 3] + ' ';
                    sk_val = 0;
                }
            }
            if (x_val != s.length) {
                var y_val = s.length;
                str_val += 'point ';
                for (var i = x_val + 1; i < y_val; i++)
                    str_val += dg_val[n_val[i]] + ' ';
            }
            return str_val.replace(/\s+/g, ' ');
        }
    },
    refundamount_posted: function (value, locale) {
        if (!value) return '';

        if (value.toLocaleLowerCase() === 'n') {
            return locale.refundamt_no
        }
        else if (value.toLocaleLowerCase() === 'y') {
            return locale.refundamt_yes
        }
    },
    refundamount_posted_label_variant: function (value) {
        if (!value) return '';
    },
    confirm_status_label: function (value, locale) {
        if (!value) return '';

        if (value === '1') {
            return locale.confirm_status_yes
        }
        else if (value === '0') {
            return locale.confirm_status_no
        }
    },
    confirm_status_label_variant: function (value) {
        if (!value) return '';
    },
    cash_type: function (value, locale) {
        if (!value) return '';

        if (value.toLocaleLowerCase() === 'inflow') {
            return locale.inflow
        }
        else if (value.toLocaleLowerCase() === 'outflow') {
            return locale.outflow
        }
    },
    cash_type_label_variant: function (value) {
        if (!value) return '';

        if (value.toLocaleLowerCase() === 'outflow') {
            return 'danger'
        }
        else if (value.toLocaleLowerCase() === 'inflow') {
            return 'success'
        }
    },
    stampduty_posted: function (value, locale) {
        if (!value) {
            return locale.stamp_not_posted;
        }
        if (value === 'N') {
            return locale.stamp_not_posted
        }
        else if (value === 'Y') {
            return locale.stamp_posted
        }
    },
    stampduty_posted_label_variant: function (value) {
        if (!value) {
            return 'success';
        }
        if (value === 'Y') {
            return 'danger'
        }
        else if (value === 'N') {
            return 'success'
        }
    },
    stpmatch_label: function (value, locale) {
        if (!value) return '';

        if (value === '0') {
            return locale.stp_not_matched
        }
        else if (value === '1') {
            return locale.stp_matched
        }
    },
    basket_label: function (value, locale) {
        if (!value) return '';

        if (value === '0') {
            return locale.basket_not_generated
        }
        else if (value === '1') {
            return locale.basket_generated
        }
    },
    acknowledge_label: function (value, locale) {
        if (!value) return '';

        if (value === '0') {
            return locale.not_acknowledged
        }
        else if (value === '1') {
            return locale.acknowledged
        }
    },
    status_label: function (value, locale) {
        if (!value) return '';

        if (value === '0') {
            return locale.unauthorised
        }
        else if (value === '1') {
            return locale.authorised
        }
        else if (value === '2') {
            return locale.cancelled
        }
        else if (value === '3') {
            return locale.deleted
        }
    },
    status_label_variant: function (value) {
        if (!value) return '';

        if (value === '0') {
            return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 7.01088 15.7098 5.10322 14.3033 3.6967C12.8968 2.29018 10.9891 1.5 9 1.5ZM9 15C5.68629 15 3 12.3137 3 9C3 5.68629 5.68629 3 9 3C12.3137 3 15 5.68629 15 9C15 10.5913 14.3679 12.1174 13.2426 13.2426C12.1174 14.3679 10.5913 15 9 15ZM10.92 6.6825L11.3175 7.08C11.39 7.14805 11.4311 7.24306 11.4311 7.3425C11.4311 7.44194 11.39 7.53695 11.3175 7.605L9.93 9L11.3175 10.395C11.39 10.463 11.4311 10.5581 11.4311 10.6575C11.4311 10.7569 11.39 10.8519 11.3175 10.92L10.92 11.3175C10.8519 11.39 10.7569 11.4311 10.6575 11.4311C10.5581 11.4311 10.463 11.39 10.395 11.3175L9 9.93L7.605 11.3175C7.53695 11.39 7.44194 11.4311 7.3425 11.4311C7.24306 11.4311 7.14805 11.39 7.08 11.3175L6.6825 10.92C6.60999 10.8519 6.56886 10.7569 6.56886 10.6575C6.56886 10.5581 6.60999 10.463 6.6825 10.395L8.07 9L6.6825 7.605C6.60999 7.53695 6.56886 7.44194 6.56886 7.3425C6.56886 7.24306 6.60999 7.14805 6.6825 7.08L7.08 6.6825C7.14805 6.60999 7.24306 6.56886 7.3425 6.56886C7.44194 6.56886 7.53695 6.60999 7.605 6.6825L9 8.07L10.395 6.6825C10.463 6.60999 10.5581 6.56886 10.6575 6.56886C10.7569 6.56886 10.8519 6.60999 10.92 6.6825Z" fill="#FF316F"/>
          </svg>`
        }
        else if (value === '1') {
            return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 7.01088 15.7098 5.10322 14.3033 3.6967C12.8968 2.29018 10.9891 1.5 9 1.5ZM9 15C5.68629 15 3 12.3137 3 9C3 5.68629 5.68629 3 9 3C12.3137 3 15 5.68629 15 9C15 10.5913 14.3679 12.1174 13.2426 13.2426C12.1174 14.3679 10.5913 15 9 15ZM11.34 6.3675C11.4858 6.22457 11.7192 6.22457 11.865 6.3675L12.24 6.765C12.311 6.83541 12.3509 6.93126 12.3509 7.03125C12.3509 7.13124 12.311 7.22709 12.24 7.2975L8.025 11.5125C7.95695 11.585 7.86194 11.6261 7.7625 11.6261C7.66306 11.6261 7.56805 11.585 7.5 11.5125L5.7375 9.735C5.66651 9.66459 5.62658 9.56874 5.62658 9.46875C5.62658 9.36876 5.66651 9.27291 5.7375 9.2025L6.135 8.805C6.20305 8.73249 6.29806 8.69136 6.3975 8.69136C6.49694 8.69136 6.59195 8.73249 6.66 8.805L7.785 9.9225L11.34 6.3675Z" fill="#27CE88"/>
            </svg>`
        }
        else if (value === '2') {
            // info
            return ''
        }
        else if (value === '3') {
            // danger
            return ''
        }
    },
    settled_status_label: function (value, locale) {
        if (!value) return '';

        if (value === 'C') {
            return locale.cancelled
        }
        else if (value === 'Y') {
            return locale.settled
        }
        else if (value === 'N') {
            return locale.pending
        }
    },
    settled_status_variant: function (value) {
        if (!value) return '';

        if (value === 'C') {
            return 'danger'
        }
        else if (value === 'Y') {
            return 'primary'
        }
        else if (value === 'N') {
            return 'info'
        }
    },
    commaSepWithDecimal: function (value, index) {
        if(value==null || value=="") return "-";
        if(index==="") return value;
        if(index===0){ return Number((value).toFixed()).toLocaleString("en-IN") };
        return parseFloat(value).toLocaleString("en-IN", { minimumFractionDigits: index });
    }
}