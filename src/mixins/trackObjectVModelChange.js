/** 
* Mixin factoty function
* 
*/
export default function trackVModelChange() {
    let _modals = {}, _originalData = {}, watchersList = {}, isTrackerIsEnabled = false;
    function clearKeysOfModal(object) {
        Object.keys(object).forEach(function (key) { delete object[key]; });
    }
    return {
        created() {
            isTrackerIsEnabled = false;
        },
        beforeDestroy() {
            this.$_removeAllTrackerWathers()
        },
        methods: {
            $_removeAllTrackerWathers() {
                Object.keys(watchersList).forEach(key => {
                    if (watchersList[key] && this.isFunction(watchersList[key]))
                        watchersList[key]()
                })
            },
            $_isRecordEdited() {
                // If Tracker is not enabled, than return true
                if (this.isFalsyValue(isTrackerIsEnabled))
                    return true;
                if (this.isPlainObject(_modals)) {
                    for (const key of Object.keys(_modals))
                        if (this.isTrue(_modals[key]))
                            return true;
                }
                return false;
            },
            $_handleObjectModelChange(model) {
                const _this = this
                if (this.isFalsyValue(model))
                    return {};
                clearKeysOfModal(_modals);
                clearKeysOfModal(_originalData);
                _originalData = _.cloneDeep(model);
                (function () {
                    isTrackerIsEnabled = true;
                    if (_this.isPlainObject(model.main))
                        Object.keys(model.main).forEach((key) => {
                            function handleChange(newVal) {
                                if ((_originalData.main[key] || "") === (newVal || ""))
                                    _modals[key] = false
                                else
                                    _modals[key] = true
                            }
                            watchersList[key] = _this.$watch(
                                () => model.main[key],
                                handleChange
                            );
                        });
                    if (_this.isPlainObject(model.cust))
                        Object.keys(model.cust).forEach((key) => {
                            function handleChange(newVal) {
                                if ((_originalData.cust[key] || "") === (newVal || ""))
                                    _modals[key] = false
                                else
                                    _modals[key] = true
                            }
                            watchersList[key] = _this.$watch(
                                () => model.cust[key],
                                handleChange
                            );
                        });
                    if (_this.isPlainObject(model.tables))
                        Object.keys(model.tables).forEach((key) => {
                            function handleChange(newVal) {
                                // If new Val and original data is array
                                if (_this.isPlainArray(_originalData.tables[key]) && _this.isPlainArray(newVal)) {
                                    if (_originalData.tables[key].length === 0 && newVal.length === 0)
                                        return _modals[key] = false
                                    else {
                                        for (let original of _originalData.tables[key]) {
                                            for (let object of newVal) {
                                                for (let keys in object) {
                                                    if ((original[keys] || "") === (object[keys] || ""))
                                                        _modals[key] = false
                                                    else {
                                                        _modals[key] = true
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        return _modals[key] = true
                                    }
                                }
                            }

                            watchersList[key] = _this.$watch(
                                key,
                                handleChange,
                                {
                                    deep: true
                                }
                            );
                        });
                })();
            }
        }
    }
};