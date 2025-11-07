import { mapState, mapActions } from "vuex";
export const ActionMixin = {
    props: {
        // readApi: {
        //     type: String
        // },
        customPayload: {
            type: Object
        },
        // moduleBasedActionCompPath: {
        //     type: String
        // },
        // filterSetting: {
        //     type: Object
        // }
    },
    data() {
        return {
            checkedArr: []
        };
    },
    computed: {
        ...mapState(["selectedFilters"]),
        ...mapState("ChoseRecord", ["checkedItemList"]),
        Actions() {
            return () => import(`@/modules${this.moduleBasedActionCompPath}/Actions`);
        },
    },
    watch: {},
    filters: {},
    methods: {
        ...mapActions("ChoseRecord", {
            resetCheckedItem: "reset"
        }),
        onCheckedCard(referenceKey, item = this.checkedItemList) {
            const itemsArray = Array.isArray(item) ? item : [item];
            this.checkedArr = this.$_getCheckedItems({ items: itemsArray, referenceKey: referenceKey });
            return this.checkedArr;
        },
        onAction({ payload, scope, action, url, data_ref, collection, confirm, referenceKey, msg }, isProgress = false) {
            if (data_ref && Object.keys(data_ref).length) {
                this.$store.dispatch("ChoseRecord/selectRecords", [data_ref]);
            }

            let _scope = scope ? scope : {}
            !isProgress && this.$store.commit("loading", true);
            const _this = this;
            if (confirm == false) {
                this.requestCall({ payload,scope, action, url, data_ref, collection, confirm, referenceKey, _this, _scope, isProgress })
            }
            else {
                this.$_confirmMessage({ action: action, msg: msg })
                    .then(async (value) => {
                        if (value) {
                            this.requestCall({ payload,scope, action, url, data_ref, collection, confirm, referenceKey, _this, _scope, isProgress })
                        }
                        else {
                            !isProgress && _this.$store.commit("loading", false);
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    });
            }
        },
        async requestCall({ payload,scope, action, url, data_ref, collection, confirm, referenceKey, _this, _scope, isProgress }) {
            let processid = null;
            const vObj = {
                // filter: {
                ..._scope,
                // "data": _this.checkedArr,
                "data": payload || _this.onCheckedCard(referenceKey || _this.referenceKey),
                // }
            };
            console.log(_this.onCheckedCard(referenceKey || _this.referenceKey));

            if (isProgress) {
                let PROCESS_ID = await _this.$showProcessStatus.getPorcessId();
                processid = collection + "_" + PROCESS_ID;
                vObj.filter.processid = processid
            }

            (function fn() {
                vObj["_ignore_prc_con"] = this.ignore_prc_con;
                this.$credCAPI
                    .collection(url)
                    .read({ body: vObj })
                    .then((response) => {
                        !isProgress && this.$store.commit("loading", false);
                        !isProgress && this.$responseHandler(response, fn, this, "noRouteChange");

                        if (isProgress) {
                            this.resetCheckedItem();
                            this.$store.commit("OnActionPerformed", true);
                        }
                    })
                    .catch((error) => console.error(error));
            }.call(_this));

            isProgress && _this.$showProcessStatus({ processName: processid })
        },
        $action_onDelete({ payload,collection, data_ref, scope, referenceKey, msg, url }) {
            this.onAction({
                url: url || `${collection}/update/delete`,
                action: `${this.localeEl.actions['delete'] || 'delete'}`,
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                msg,
                payload
            });
        },
        $action_onUnDelete({ collection, data_ref, scope, referenceKey,msg }) {
            this.onAction({
                url: `${collection}/update/undelete`,
                action: (this.localeEl.actions['undelete'] || 'un delete').toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                msg
            });
        },
        $action_onAuthorise({ collection, data_ref, scope, referenceKey,msg }) {
            // if(this.checkedItemList.length == 0) return this.$_showAlert("Alert", "Please select at-least one record");
            this.onAction({
                url: `${collection}/update/authorise`,
                action: (this.localeEl.actions['authorise'] || 'authorise').toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                msg
            });
        },
        $action_onUnAuthorise({ collection, data_ref, scope, referenceKey, msg }) {
            this.onAction({
                url: `${collection}/update/unauthorise`,
                action: (this.localeEl.actions['unauthorise'] || 'un authorise').toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                msg
            });
        },
        $action_onActivate({ collection, data_ref, scope, referenceKey, msg }) {
            this.onAction({
                url: `${collection}/update/activate`,
                action: (this.localeEl.actions['activate'] || 'activate').toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                msg
            });
        },
        $action_onDeactivate({ collection, data_ref, scope, referenceKey, msg }) {
            this.onAction({
                url: `${collection}/update/deactivate`,
                action: (this.localeEl.actions['deactivate'] || 'deactivate').toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                msg
            });
        },
        $action_onUnlock({ collection, data_ref, scope, referenceKey, msg }) {
            this.onAction({
                url: `${collection}/update/unlock`,
                action: (this.localeEl.actions['unlock'] || 'unlock').toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                msg
            });
        },
        $action_onResetPassword({ collection, data_ref, scope, referenceKey, msg }) {
            this.onAction({
                url: `${collection}/resetpassword `,
                action: (this.localeEl.actions['reset_password'] || 'reset_password').toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                msg
            });
        },
        $action_onConfirm({ collection, data_ref, scope, referenceKey, msg }) {
            this.onAction({
                url: `${collection}/update/confirm`,
                action: (this.localeEl.actions['confirm'] || 'confirm').toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                msg
            });
        },
        $action_onSettle({ collection, data_ref, scope, referenceKey }) {
            this.onAction({
                url: `${collection}/update/settle`,
                action: (this.localeEl.actions['settle'] || 'settle').toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey
            });
        },
        $action_onProcess({ collection, data_ref, scope, referenceKey }) {
            this.onAction({
                url: `${collection}/process`,
                action: (this.localeEl.actions['post'] || 'post').toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey
            }, false);
        },
        $action_onCancel({ collection, data_ref, scope, referenceKey, confirm,
            msg }) {
            this.onAction({
                url: `${collection}/update/cancel`,
                action: this.localeEl.actions['cancel'].toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                confirm,
                msg
            });
        },
        $action_Acknowledge({ collection, data_ref, scope, referenceKey }) {
            this.onAction({
                url: `${collection}/update/ack`,
                action: this.localeEl.actions['acknowledge'].toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
                confirm: false
            });
        },
        $action_ConfirmAll({ collection, data_ref, scope, referenceKey }) {
            this.onAction({
                url: `${collection}/create/all`,
                action: this.localeEl.actions['confirm_all'].toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
            });
        },
        $action_onModify({ collection, data_ref, scope, referenceKey }) {
            if (data_ref && Object.keys(data_ref).length) {
                this.$store.dispatch("ChoseRecord/selectRecords", [data_ref]);
            }
            this.$router.push({ path: collection, query: { reference: JSON.stringify(this.onCheckedCard(referenceKey || this.referenceKey, data_ref)[0]) } });
            // this.$router.push({ path: collection, query: { reference: JSON.stringify({[referenceKey]: data_ref[referenceKey]}) } });
        },
        $action_checkCardIndex(obj) {
            const index = this.checkedItemList.indexOf(obj);
            return (index > -1) ? true : false
        },
        $action_onRebalance({ collection, data_ref, scope, referenceKey }) {
            this.onAction({
                url: `${collection}/create`,
                action: (this.localeEl.actions['rebalance']).toLowerCase(),
                data_ref: data_ref || {},
                scope: scope,
                collection,
                referenceKey,
            });
        },
        downloadData(type, options) {
            this.$emit("download", {type, options});
        },
        $_customModal({ size, html, title, hideFooter }) {
            const h = this.$createElement;
            const messageVNode = h('div', { class: ['confirm-box'], domProps: { innerHTML: html || '' } });
            return this.$bvModal.msgBoxConfirm([messageVNode], {
                titleHtml: title || '',
                size: size,
                buttonSize: 'md',
                noCloseOnBackdrop: true,
                noCloseOnEsc: true,
                okVariant: 'primary',
                okTitle: 'Save',
                cancelTitle: 'Cancel',
                footerClass: !!hideFooter ? 'hidden' : 'p-2',
                hideHeaderClose: !!hideFooter ? false : true,
                centered: true
            });
        },
        copyToClipboardTable(arrayOfObjectsData, successMessage) {
			const items = arrayOfObjectsData || [];
			if (!items || items.length === 0) {
				this.$_errorMessage('No data to copy!');
				return;
			}
			const headers = Object.keys(items[0]);

			// Format the headers
			let result = headers.map((header, index) => header).join('\t') + '\n';

			// Format the rows
			items.forEach(item => {
				const row = headers.map((header, index) => (item[header] ? item[header].toString() : '')).join('\t');
				result += row + '\n';
			});

			// Create a temporary textarea to hold the text
			const textarea = document.createElement('textarea');
			textarea.value = result;
			document.body.appendChild(textarea);
			textarea.select();

			try {
				document.execCommand('copy');
				this.$_successMessage( successMessage || 'Copied!');
			} catch (err) {
				this.$_errorMessage('Error occurred while copying to clipboard.');
			} finally {
				document.body.removeChild(textarea);
			}
		}
    },
};
