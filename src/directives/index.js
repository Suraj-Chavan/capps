import amountFormat from "@/directives/amountFormat.js";

export default {
	amountFormat,
	numericOnly: {
		bind(el) {
			el.addEventListener("keypress", function (e) {
				// Check if decimal is allowed if not allow it
				if (el.isDecimal == true && event.charCode == 46) {
					e.preventDefault();
				}
				if (
					[46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
					// // Allow: Ctrl+A
					// (e.keyCode === 65 && e.ctrlKey === true) ||
					// // Allow: Ctrl+C
					// (e.keyCode === 67 && e.ctrlKey === true) ||
					// // Allow: Ctrl+X
					(e.keyCode === 88 && e.ctrlKey === true) ||
					// Allow: home, end, left, right
					(e.keyCode >= 35 && e.keyCode <= 39) 
					// ||
					// Allow M B K Chareactor
					// e.keyCode == 107 ||
					// e.keyCode == 75 ||
					// e.keyCode == 98 ||
					// e.keyCode == 66 ||
					// e.keyCode == 109 ||
					// e.keyCode == 77
				) {
					// let it happen, don't do anything
					return;
				}
				// Ensure that it is a number and stop the keypress
				if (
					e.keyCode <= 44 ||
					e.keyCode > 57 ||
					e.keyCode == 45 ||
					e.keyCode == 47
				) {
					e.preventDefault();
				}
			});
		},
	},
	uppercase: {
		bind(el, binding, vnode) {
			// console.log("bind");
			if (binding) {

				var handlerInput = function (e) {
					var str = e.target.value;
					let re = /[^a-zA-Z]/gi;
					e.target.value = str.replace(re, "").toUpperCase()
				};
				var handlerBlur = function (e) {
					
				};

				el.addEventListener("input", handlerInput);
				el.addEventListener("blur", handlerBlur);
			}
		},
		inserted(el, binding, vndoe) {
			// console.log("inserted");
		},
		updated(el, binding, vnode) {
			// console.log("updated");
		},
		componentUpdated(el, binding, vnode, oldVnode) {
			// console.log("componentUpdated");
		},
	},
	dayFormat: {
		bind(el, binding, vnode) {
			if (binding) {
				const period = binding.value;

				var handlerInput = function (e) {
					var str = e.target.value;

					if (e.data === null) {
						str.substring(0, str.length);
						e.target.value = str;
					} else {
						var period =
							e.data == "d" ||
							e.data == "D" ||
							e.data == "m" ||
							e.data == "M" ||
							e.data == "y" ||
							e.data == "Y"
								? e.data
								: "D";

						str = str.replace(/[^0-9\.]+/g, "");
						e.target.value = str + " " + period.toUpperCase();
					}
				};
				var handlerBlur = function (e) {
					var pattern = /^\d+$/;
					var str = e.target.value;
					if (pattern.test(str)) {
						e.target.value = str + " " + "D";
					}
				};

				el.addEventListener("input", handlerInput);
				el.addEventListener("blur", handlerBlur);
			}
		},
		inserted(el, binding, vndoe) {
			// console.log("inserted");
		},
		updated(el, binding, vnode) {
			// console.log("updated");
		},
		componentUpdated(el, binding, vnode, oldVnode) {
			// console.log("componentUpdated");
		},
	}
};
