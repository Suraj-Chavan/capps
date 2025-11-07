const debounce = function debounce(fn, delay) {
	var timeoutID = null;
	return function () {
		clearTimeout(timeoutID);
		var args = arguments;
		var that = this;
		timeoutID = setTimeout(function () {
			fn.apply(that, args);
		}, delay);
	};
};
export const DataEntryMixin = {
	data() {
		return {
			vErrors: {},
			vErrorsList: [],
			vModalRoutes: {
			}
		};
	},
	watch: {
		vErrors(newval) {
			this.vErrorsList = []
			for (var i in newval) {
				if (newval[i].length)
					this.vErrorsList.push(newval[i][0])
			}
			this.$store.commit("OnValidationErrors", this.vErrorsList);
			this.$bvToast.show("validation_toast")
		},
	},
	mounted() {

	},
	methods: {
		getSelectedValue(data) {
			if (data.refsModel)
				this.$set(this.vm[data.refsModel], data.nameRef, data.val);
			else
				this.$set(this.vm, data.nameRef, data.val);
		},
		$de_disable_fields(arr, val) {
			for (var i in arr) {
				this.el[arr[i]] = this.el[arr[i]].map((item) => ({
					...item,
					disabled: val,
				}));
			}
		},
		$de_deleteRow(val) {
			if (val.msg == 'validate') {
				this.$root.$emit('VALIDATE_ROW', val);
			} else if (val.msg == 'deleteData') {
				val.arr.splice(val.index, 1);
				this.$root.$emit('DELETE_ROW', 'deleted');
			}
			else {
				val.arr.splice(val.index, 1);
			}
		},
		$de_showErrors(formObserver) {
			setTimeout(() => (this.vErrors = formObserver.errors), 500);
		},
		$de_radioSelectRow(obj) {
			this[obj.dataref] = this[obj.dataref].map(function (item, index) {
				if (item == obj.item) {
					item.IS_DEFAULT = "1"
				}
				else {
					item.IS_DEFAULT = "0"
				}
				return {
					...item
				}
			})
			// this[obj.dataref][obj.index]['isDefault'] = 'Y'
		},
	},
};
