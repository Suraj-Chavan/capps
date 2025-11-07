const pagebuilder = require("./pagebuilder");


module.exports = () => {
    return  {
    // #/launcher/Dashboard_1
    ...pagebuilder,

    // #/credbooks/doc/accounting_entries_mast/view/list
    accounting_entries_mast_en: require("./capps/credbooks/en.json"),
    accounting_entries_mast_config: require("./capps/credbooks/config.json"),
    accounting_entries_mast_schema: require("./capps/credbooks/accounting_entries_mast/schema.json"),
    accounting_entries_mast_viewread: require("./capps/credbooks/accounting_entries_mast/viewread.json"),
    accounting_entries_mast_list: [require("./capps/credbooks/accounting_entries_mast/list.js")],
    accounting_entries_mast_card: [require("./capps/credbooks/accounting_entries_mast/card.js")],
    accounting_entries_mast_form: [require("./capps/credbooks/accounting_entries_mast/form.js")],

    // #/mudra2/doc/corporates/view/list
    corporates_en: require("./capps/mudra2/en.json"),
    corporates_config: require("./capps/mudra2/config.json"),
    corporates_schema: require("./capps/mudra2/corporates/schema.json"),
    corporates_viewread: require("./capps/mudra2/corporates/viewread.json"),
    corporates_list: [require("./capps/mudra2/corporates/list")],
    corporates_card: [require("./capps/mudra2/corporates/card")],
    corporates_form: [require("./capps/mudra2/corporates/form")],

    
    // #/mudra2/doc/corporates/view/list
    forex_en: require("./capps/mudra2/en.json"),
    forex_config: require("./capps/mudra2/config.json"),
    forex_schema: require("./capps/mudra2/forex/schema.json"),
    forex_viewread: require("./capps/mudra2/forex/viewread.json"),
    forex_list: [require("./capps/mudra2/forex/list")],
    forex_form: [require("./capps/mudra2/forex/form")]

    }
}