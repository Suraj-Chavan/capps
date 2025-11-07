export const Globalmixin = {
  data: () => ({
    ds: {}, // Data Set
    ds_prefetched: {}, // Data Set
    ignore_prc_con: "n", // Confirm Validation flag for crate and update requests
  }),
  watch: {

  },
  computed: {

  },
  methods: {
    async $responseHandler(response, callback, _this, mainScreen, onCompletion) {

      if (response && response.status == "unsuccess") {
        await _this.$_showAlert("Alert", (response.msg || response.error), (response.details || []), false);
        _this.ignore_prc_con = "n"
        this.$store.commit("ChoseRecord/RESET");
        this.$store.commit("OnActionPerformed", true);
        return response
      }

      if (response && response.status == "confirm") {
        await _this.$_confirmMessage({
          msg: (response.msg || response.error),
          title: "Confirm"
        }).then(confirm => {
          if (confirm) {
            _this.ignore_prc_con = "y"
            callback.call(_this)
          }
          _this.ignore_prc_con = "n"
        })
        return response;
      }

      _this.ignore_prc_con = "n"
      await _this.$_showAlert("Success", response.msg || "Action performed successfully", null, false);

      await setTimeout(function () {
        if (!mainScreen) _this.$router.go(-1);
      }, 1000);

      onCompletion && onCompletion();

      this.$store.commit("ChoseRecord/RESET");
      this.$store.commit("OnActionPerformed", true);
      return response;
    },
    groupBy(xs, key) {
      return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    },
    $_getDatalist(list, datalist, filterBasedOn) {
      const vObj_static = {
        "filter": [
          {
            "field": "MODULE_NAME",
            "value": list,
            "asgn": "in",
            "type": "string"
          }
        ]
      };
      const vObj_datalist = {
        "filter": datalist,
        "jsonData": filterBasedOn ? { ...filterBasedOn } : {}
      };
      var that = this;

      const datalistRead = (datalist) ? that.$credCAPI
        .collection("capps/datalist/read")
        .read({ body: vObj_datalist })
        .then((response) => {
          return response
        })
        .catch(error => console.error(error)) : [];

      return Promise.all([datalistRead])
    },
    $_successMessage(msg) {
      const h = this.$createElement;
      const messageVNode = h('div', { domProps: { innerHTML: msg } });

      this.$bvToast.toast([messageVNode], {
        title: "Success !!!",
        variant: 'success',
        solid: true,
        autoHideDelay: 3000,
      })
      this.$store.commit("loading", false);
    },
    $_errorMessage(msg) {
      const h = this.$createElement;
      const messageVNode = h('div', { domProps: { innerHTML: msg } });

      this.$bvToast.toast([messageVNode], {
        title: "Error !!!",
        variant: 'danger',
        solid: true,
        autoHideDelay: 3000,
      })
      this.$store.commit("loading", false);
    },
    $_confirmMessage({ action, size, msg, title }) {
      const h = this.$createElement;
      const messageVNode = h('div', { class: ['confirm-box'], domProps: { innerHTML: msg || `Are you sure you want to ${action}?` } });
      return this.$bvModal.msgBoxConfirm([messageVNode], {
        // title: title || 'Confirm',
        size: size || 'sm',
        buttonSize: 'sm',
        okVariant: 'primary',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
        autoFocusButton: "ok"
      });
    },
    $_showAlert(title, msg, details, noCloseOnBackdrop = true) {
      let listMessages = [];
      if(Array.isArray(msg)) {
        listMessages = [...listMessages, ...msg];
        msg = "Alert:";
      }
      if(Array.isArray(details)) {
        listMessages = [...listMessages, ...details];
      }
      const h = this.$createElement;
      let listMessagesNode = '';
      listMessages = listMessages.length > 0 && listMessages.map((msg) => '<li>' + msg + '</li>');
      if (!!listMessages.length > 0) {
        listMessagesNode = h('ol', { class: ['details-msg'], domProps: { innerHTML: listMessages || '' } });
      } else {
        listMessagesNode = ''
      }

      const messageVNode = h('div', { class: ['confirm-box'], domProps: { innerHTML: msg || `<b>Something unexpected happened</b>` } });
      return this.$bvModal.msgBoxOk([messageVNode, listMessagesNode], {
        // title: title || undefined,
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'success',
        centered: true,
        noCloseOnBackdrop,
        autoFocusButton: "ok"
      });
    },
    async $_setFilter(dsName, columnName, codeField, filterBasedOn, val) {
      if (this.ds_prefetched[dsName] == undefined) {
        let promise = new Promise((resolve, reject) => {
          setTimeout(() => resolve("done!"), 1000)
        });
        let result = await promise; // wait until the promise resolves (*)
      }
      const filtered = this.ds_prefetched[dsName].filter((item) => {
        return item[filterBasedOn] == val;
      });

      const check_filtered = filtered.filter((item) => {
        return item[codeField] == this.vm[columnName];
      });

      const finalVal = check_filtered.length ? check_filtered : filtered

      if (filtered.length) {
        this.$set(this.ds, dsName, filtered);
        this.$set(
          this.vm,
          columnName,
          // filtered[0] ? filtered[0][codeField].toString() : ""
          finalVal[0] ? finalVal[0][codeField].toString() : ""
        );
      }
    },
    $_getCheckedItems({ items, referenceKey }) {
      const _list = []
      items.forEach((element,) => {
        var _key = {}
        for (var i in element) {
          if (referenceKey.indexOf(i) >= 0) {
            _key[i] = element[i];
          }
        }
        _list.push(_key)
      });
      return _list
    },
    $_getFieldData(fields, localeName) {
      const _f = []
      fields.forEach(element => {
        let str = element?.includes('_NAME') ? element?.replace('_NAME', '') : element

        _f.push({
          key: element,
          label: localeName.hasOwnProperty(str) ? localeName[str] : str.replace("_", " "),
          sortable: false
        })
      });
      return _f
    },
    $_getColumnData(fields, localeName) {
  
      const _f = fields.map(item => {
        item.label = localeName[item.key],
          item.sortable = true
        return item
      });
      return _f
    },
    $_selectInput(e) {
      e.target.select()
    },
    $_handleOnlyDecimalInput(e) {
      var charCode = e.which ? e.which : e.keyCode;
      if (charCode === 46) {
        e.preventDefault();
        return false;
      }
    },
    $_handleAmountChange(e) {
      if (!!this.$currencySymbolToNumber(e.target.value))
        // this.vm.AMOUNT = this.$convertCommaString(this.$currencySymbolToNumber(e.target.value));
        this.vm[e.target.name] = this.$convertCommaString(this.$currencySymbolToNumber(e.target.value));
      else
        e.target.value = this.vm[e.target.name] || '';
    },
    $_handleDecimalInput(e) {
      var charCode = e.which ? e.which : e.keyCode;
      if (
        charCode == 46 ||
        (charCode >= 60 && charCode <= 90) ||
        (charCode >= 97 && charCode <= 122)
      ) {
        e.preventDefault();
        return false;
      } else if (charCode < 48 || charCode > 57) {
        return true;
      }
    },
    $_showNotificationSpinner(msg, zindx) {
      var elem = document.createElement('div');
      elem.setAttribute('id', 'notificationspinner');
      elem.innerHTML = `<div id="spinnercontainer" style='z-index: ${!!zindx ? zindx : 1}'><div class="spinnertext">
      <span class="spinner-loader"><i class="fa fa-spinner" aria-hidden="true"></i></span>${msg}</div>
      </div>`;
      document.body.appendChild(elem);
    },
    $_closeNotificationSpinner() {
      var elem = document.getElementById("notificationspinner");
      (elem && elem.parentNode) && elem.parentNode.removeChild(elem);
    },
		$_getOptionsLabel(label) {
			if(!label){
				return "-"
			}
			if (["Y"].includes(label.toUpperCase())) {
				return `<span class="badge badge-success-custom text-sm">YES</span>`
			}

			if (["N"].includes(label.toUpperCase())) {
				return `<span class="badge badge-danger-custom text-sm">NO</span>`
			}
		}
  }
};
