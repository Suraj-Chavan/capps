import { extend } from 'vee-validate';
import * as rules from 'vee-validate/dist/rules';
import { messages } from 'vee-validate/dist/locale/en.json';

Object.keys(rules).forEach(rule => {
  extend(rule, {
    ...rules[rule], // copies rule configuration
    message: messages[rule] // assign message
  });
});


extend("numeric_comma", {
  params: ["numeric_comma"],
  validate: (value) => {
   // var pattern = /\d{1,2}[,.]\d{1,2}/;
    var pattern = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:(\.|,)\d+)?$/;
    if (pattern.test(value)) {
      return true;
    }
    return false;
  },
  message:
    "The {_field_} may only contain numeric characters"
});

// extend("decimal2", {
//   params: ["decimal"],
//   validate: (value, {decimal}) => {
   
//     const pattern = `^(?:\d*\.\d{1,\\${decimal}}|\d+)$`;

    
//     console.log(Number.isInteger(Number(value)))
//     if (Number.isInteger(Number(value)) || pattern.test(value)) {
//       return true;
//     }
//     return false;
//   },
//   message:
//     "The {_field_} may only contain two decimal placess"
// });


// extend("decimal", {
//   validate: (value, args) => {
//     const separator = '.'
//     if (value === null || value === undefined || value === '') {
//       return {
//         valid: false
//       };
//     }
//     if (Number(args) === 0) {
//       return {
//         valid: /^-?\d*$/.test(value),
//       };
//     }
//     const regexPart = args === '*' ? '+' : `{1,${args}}`;
//     const regex = new RegExp(`^[-+]?\\d*(\\${separator}\\d${regexPart})?([eE]{1}[-]?\\d+)?$`);

//     return {
//       valid: regex.test(value),
//     };
//   },
//   message: (fieldName, args) => {

//     return `The ${fieldName} field must contain only  ${args[0]} decimal values`
//   }
// })

extend('v_userid', {
  validate: value => {
    if (value === null || value === undefined || value === '') {
      return {
        valid: false,
        message: 'This field is required.'
      };
    }
    const hasSpacesOrSpecialChars = /[\s!@#$%^&*()+=\-[\]\\';,./{}|":<>?]/.test(value);
    return {
      valid: !hasSpacesOrSpecialChars,
      message: 'Spaces or special characters are not allowed.'
    };
  },
  message: (fieldName) => {
    return `Spaces or special characters are not allowed.`;
  }
});

/*import { required, confirmed, length, email, alpha_num, numeric, min, max, max_value } from "vee-validate/dist/rules";
import { extend, validate } from "vee-validate";

extend("required", {
  ...required
});

extend("email", {
  ...email,
  message: "This field must be a valid email"
});

extend("confirmed", {
  ...confirmed,
  message: "This field confirmation does not match"
});

extend("length", {
  ...length,
  message: "This field must have 2 options"
});

extend("alpha_num", {
  ...alpha_num,
  message: "No special character allowed"
});
extend("numeric", {
  ...numeric,
  message: "This field must be number"
});
extend("min", {
  ...min,
  params: ['min'],
  message: 'The {_field_} field must be {min} or more'
});
extend("max", {
  ...max,
  params: ['max'],
  message: 'The {_field_} field must be {max} or less'
});
extend("max_value", {
  ...max_value,
  params: ['max_value'],
  message: 'The {_field_} field must be {max_value} or less'
});
*/