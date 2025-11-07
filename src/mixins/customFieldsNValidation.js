import CustomFieldMapping from "./CustomFieldMapping"

export default function customFieldsNValidation({
    tableName,
    fld_cof_ref,
    model_main_data,
    model_custom_data
}) {
    let _this = null;
    let dataKeys = [], formKeys = [], modalData = null, custData = null, cacheValidate = {}, cacheDisabled = {}, cacheDefaults = {}, cacheHide = {}, cacheDynamicFields = [], FormConfig;

    const getRespectiveField = (fn) => (el, vm) => fn(el, vm);
    const reduceLooper = getRespectiveField(CustomFieldMapping);

    const setDataToVueVariable = function (data, vm, eventName) {
        ["validate", "hide", "defaults"].map((key) => vm.customValidation[key] = Object.assign(
            {},
            vm.customValidation[key],
            { ...vm.customValidation[key], ...data[key] })
        );
        if (vm.$isTrue(vm.$isRecordEditable))
            vm.customValidation['disabled'] = Object.assign(
                {},
                vm.customValidation['disabled'],
                { ...vm.customValidation['disabled'], ...data['disabled'] }
            )
        else {
            vm.customValidation['disabled'] = Object.assign({}, {
                ...vm.customValidation['disabled'],
                ...Object.keys(modalData)
                    .reduce((obj, key) => {
                        obj[key.toLowerCase()] = true
                        return obj
                    }, {})
            })
        }
        dataKeys.length = 0, formKeys.length = 0;
        dataKeys = Object.keys(data.defaults);
        formKeys = Object.keys(modalData);



        ["validate", "hide", "disabled"].map(key => {
            vm[key] = Object.assign({}, vm[key], vm.customValidation[key])
        });


        if (vm.$action === "create")
            vm.setDefaultValues({ modalData, custData });
    }





    return {
        data() {
            return {
                dynamicData: [],
                FormConfig: [],
                hide: {},
                validate: {},
                disabled: {},
                customValidation: {
                    validate: {},
                    disabled: {},
                    hide: {},
                    defaults: {}
                }
            }
        },


        methods: {

            isFilter(filter, formdata, ev) {
                if (!filter) return true;
                var exp = this.evalExp(filter, formdata, ev);

                try {
                    var temp = eval("(" + exp + ")");
                    if (temp) return true;
                    else return false;
                }
                catch (e) {
                    return false;
                }
            },
            evalExp(aStr, o, ev) {
                let regExp = new RegExp("{([^}]*)}", "gi");
                aStr = aStr || ""
                var result = aStr.match(regExp);
                var expression = "";
                var exprStr = "";
                var exprVal = "";
                if (result == null) return aStr;
                for (let idx = 0; idx < result.length; idx++) {
                    exprStr = result[idx];
                    expression = exprStr.replace("{", "").replace("}", "");
                    if (ev === "N")
                        exprVal = o[expression] || o[expression.toUpperCase()] || "";
                    else {
                        exprVal = expression.split(".")
                        exprVal = exprVal.reduce((accumulator, currentValue) => {
                            if (accumulator)
                                return accumulator[currentValue]
                            else
                                return accumulator
                        }, o)
                    }
                    aStr = aStr.replace(exprStr, exprVal);
                }
                return aStr;
            },
            ApplyFormConfig(event, data, formmodel, el) {
                var Result_Obj = [];
                var v_validator = {};
                var disabled = {};
                var defaults = {};
                var hide = {};

                var filter_event = data.filter((item) => {
                    return item.EVT_LIST === event;
                });



                for (var x = 0; x < filter_event.length; x++) {
                    //isFilter(filter_event[x].FILTER,formmodel);
                    if (this.isFilter(filter_event[x].FILTER, formmodel, el)) {
                        v_validator[filter_event[x].FIELDNAME] = filter_event[x].MANDATORY;
                        disabled[filter_event[x].FIELDNAME] = filter_event[x].DISABLE;
                        defaults[filter_event[x].FIELDNAME] = filter_event[x].DEFAULT_VAL;
                        hide[filter_event[x].FIELDNAME] = filter_event[x].HIDE;
                    }
                }

                Object.keys(v_validator).reduce((accuumlator, currentvalue) => {
                    let obj = (this.$isPlainObject(accuumlator[currentvalue]) ? accuumlator[currentvalue] : {});
                    accuumlator[currentvalue] = Object.assign({}, obj,
                        {
                            ...obj,
                            ...(accuumlator[currentvalue] === "Y" ? { "required": true } : accuumlator[currentvalue] === "N" ? { "required": false } : {})
                        }
                    )
                    return accuumlator
                }, v_validator);

                Object.keys(disabled).reduce((accuumlator, currentvalue) => {
                    accuumlator[currentvalue] = accuumlator[currentvalue] === "Y" ? true : false
                    return accuumlator
                }, disabled)

                Object.keys(hide).reduce((accuumlator, currentvalue) => {
                    accuumlator[currentvalue] = accuumlator[currentvalue] === "Y" ? false : true
                    return accuumlator
                }, hide)


                Result_Obj.push({ "v_validator": v_validator }, { "disabled": disabled }, { "defaults": defaults }, { "hide": hide });


                return Result_Obj;
            },





            isCached() {
                if (
                    dataKeys.length === 0 &&
                    Object.keys(cacheValidate).length === 0 &&
                    Object.keys(cacheDisabled).length === 0 &&
                    Object.keys(cacheHide).length === 0
                )
                    return false
                else {
                    setDataToVueVariable({
                        validate: cacheValidate,
                        hide: cacheHide,
                        defaults: cacheDefaults,
                        disabled: cacheDisabled
                    }, _this);
                    return true
                }
            },
            emptyObject(obj) {
                for (let prop in obj) {
                    delete obj[prop];
                }
            },
            callApplyFormConfig(event, eventName) {
                if (!eventName)
                    return
                const categoryconfig = _this.ApplyFormConfig(eventName, FormConfig, modalData, "N");
                setDataToVueVariable({
                    validate: categoryconfig[0].v_validator,
                    hide: categoryconfig[3].hide,
                    defaults: categoryconfig[2].defaults,
                    disabled: categoryconfig[1].disabled
                }, this, eventName);
            },
            appendKeysToCustomFields(custData, customFields) {
                if (_this.$isPlainArray(customFields))
                    customFields.map((item) => {
                        _this.$set(
                            custData,
                            item.COL_NAME,
                            ""
                        );
                    });
            },
            fetchCustomFields({ tableName }) {
                const promise = array => new Promise(resolve => {
                    cacheDynamicFields = _this.dynamicData = array;
                    resolve(array);
                });
                if (this.$isFalsyValue(tableName))
                    return promise([])
                if (this.$isTrue(cacheDynamicFields.length === 0))
                    // url: config.NREST + "/customfield/read",
                    this.$credCAPI
                        .collection(`etf-op/customfield/read`)
                        .read({ body: { filter: [{ "field": "cust_table_name", "value": tableName, "asgn": "eq" }] } })
                        .then(response => {
                            if ( !response || (response.status && response.status == 'unsuccess')) {
                                return promise([]);
                            }
                            _this.appendKeysToCustomFields(custData, [...response]);
                            return promise([...response]);
                        })
                        .catch((error) => {
                            console.error("Error occured while fetching custom fields", error);
                            return promise([])
                        })
                _this.appendKeysToCustomFields(custData, cacheDynamicFields);
                return promise(cacheDynamicFields)
            },
            getFormValidation({ fld_cof_ref, modalData, custData }) {
                _this.fetchCustomFields({ tableName })
                    .then(function (customFields) {
                        if (_this.$isFalse(_this.isCached({ modalData, custData }))) {
                            if (_this.$isFalsyValue(fld_cof_ref))
                                return
                            _this.$store.commit("loading", true);
                            // config.NREST + "/event_field_config/read"
                            _this.$credCAPI
                                .collection("etf-op/event_field_config/read")
                                .read({ body: { filter: [{ "field": "scr_ref", "value": fld_cof_ref, "asgn": "eq", "type": "string" }] } })
                                .then(response => {
                                    if ( !response || (response.status && response.status == 'unsuccess')) {
                                        _this.$store.commit("loading", false);
                                    }
                                    else {
                                        if (_this.$isPlainArray(response)) {
                                            _this.FormConfig.length = 0, dataKeys.length = 0, formKeys.length = 0;
                                            FormConfig = _this.FormConfig = response;
                                            const utils_data = _this.ApplyFormConfig("ievt.onScrLoad", response, modalData);
                                            cacheValidate = utils_data[0].v_validator;
                                            cacheDisabled = utils_data[1].disabled;
                                            cacheHide = utils_data[3].hide;
                                            cacheDefaults = utils_data[2].defaults
                                            setDataToVueVariable({
                                                validate: cacheValidate,
                                                hide: cacheHide,
                                                defaults: cacheDefaults,
                                                disabled: cacheDisabled
                                            }, _this);
                                        }
                                        _this.$store.commit("loading", false);
                                    }
                                })
                                .catch(error => {
                                    _this.$store.commit("loading", false);
                                    console.error("Validation rules ", error)
                                });
                        }
                    })
            },
            setDefaultValues({ modalData, custData }) {
                _this.$store.commit("loading", true);
                const setDefault = function () {
                    const event = new Event("change", { bubbles: true, cancelable: true });
                    const customfieldKeys = cacheDynamicFields.map(item => item.COL_NAME);
                    var mod = dataKeys.map(function (key) {
                        let KEY = key.toUpperCase();
                        if (customfieldKeys.includes(KEY))
                            _this.$set(
                                custData,
                                KEY,
                                _this.evalExp(_this.customValidation.defaults[key], _this)
                            );
                        else
                            _this.$set(
                                modalData,
                                KEY,
                                _this.evalExp(_this.customValidation.defaults[key], _this)
                            );
                        custData[KEY] && _this.triggerChange(key, event, custData[KEY]);
                        return { custData, modalData }
                    })
                }
                setDefault();
                _this.$nextTick().then(() => {
                    _this.$store.commit("loading", false);
                })
            },
            searchModelObject(model_main_data, model_custom_data) {
                if (typeof model_main_data !== "string")
                    throw new Error("json path of mutating formData shoud be a string");
                if (typeof model_custom_data !== "string")
                    throw new Error("json path of mutating formData shoud be a string");
                modalData = model_main_data.split('.').reduce((accumulator, currentValue) => accumulator[currentValue], this) || this.formData;
                custData = model_custom_data.split('.').reduce((accumulator, currentValue) => accumulator[currentValue], this) || this.additionalDetails_formdata;
            },
            triggerChange(ref, event, val) {
                if (this.$refs[ref] != null && this.$isPlainObject(this.$refs[ref].$listeners) && this.$isFunction(this.$refs[ref].$listeners.change)) {
                    this.$refs[ref].$listeners.change(val);
                }
            },
            createOptions(string) {
                let vArray = [];
                string.split(",").map((r) => vArray.push({ CODE: r, DESCR: r }));
                return vArray;
            }

            , getTemplateCustomFields(customFields) {
                return customFields.reduce((accumlator, el) => {
                    const TransformedObject = reduceLooper(el, this);
                    TransformedObject && accumlator.push(TransformedObject);
                    return accumlator
                }, [])
            }

        },


        created() {
            _this = null;
            _this = this
            if (!model_main_data)
                model_main_data = ""
            if (!model_custom_data)
                model_custom_data = ""
            this.searchModelObject(model_main_data, model_custom_data);
            this.getFormValidation({ fld_cof_ref, modalData, custData });
        },



        computed: {
            $isRecordEditable() {
                return this.$isUndef(this.isRecordEditable) || this.$isTrue(this.isRecordEditable) ? true : false;
            },
            $action() {
                // If action is not provided default will be add.
                return this.$isUndef(this.scope) ? "create" : this.scope;
            }
        },
    }
}