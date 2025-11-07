export default function CustomFieldMapping(el, vm) {
    const object = {
        name: el.COL_NAME,
        "label": el.COL_NAME,
        // placeholder: el.COL_NAME
    }
    switch (el.COL_TYPE) {
        case "string":
            if (el.COL_VALUES != null) {
                vm.ds = vm.ds || {};
                const dataset = "ds-custom-" + el.COL_NAME;
                vm.ds[dataset] = vm.createOptions(el.COL_VALUES);
                return {
                    ...object,
                    type: "select",
                    ds: dataset,
                    "ds-code": "CODE",
                    "ds-name": "DESCR",
                }
            }
            if (el.COL_VALUES == null && el.CODEFIELD == null)
                return {
                    ...object,
                    type: "text",
                }
            if (el.CODEFIELD !== null)
                return {
                    ...object,
                    type: "remote-select",
                    "data-list": "ds-customdata",
                    "ds-code": el.CODEFIELD,
                    "ds-name": el.NAMEFIELD,
                    fieldlist: "{'field':'cust_table_name','value':'" + el.CUST_TABLE_NAME + "','asgn':'eq'},{'field':'col_name','value':'" + el.COL_NAME.toLowerCase() + "','asgn':'eq'}",

                }
        case "number":
            if (el.COL_VALUES == null)
                return {
                    ...object,
                    type: "number",
                }
        case "time12":
            return {
                ...object,
                type: "time12",
                valueType: "format",
                editable: false,
                format: vm.$time12Format || "hh:mm:ss a"
            }
        case "time24":
            return {
                ...object,
                type: "time24",
                valueType: "format",
                editable: false,
                format: vm.$time24Format || "HH:mm:ss"
            }
        case "date":
            return {
                ...object,
                type: "date",
            }
        default:
            return undefined;
    }
};