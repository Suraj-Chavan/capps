module.exports = `capps.ui.forex.form = {
    PORTCODE: async function (frm) {
        let portfolioDetails = await capps.rest.credbooks.portfolios.read({ filter: [{ field: "PORTCODE", value: current_form.PORTCODE, asgn: "eq", type: "string" }] });
        frm.set_value("PORTFOLIO", portfolioDetails[0]?.PORTFOLIO || "")

        if (Array.isArray(portfolioDetails) && portfolioDetails.length > 0) {
            portfolioDetails = portfolioDetails[0] || {};
            frm.set_value("ACCOUNTING_UNIT_CODE", portfolioDetails.ACCOUNTING_UNIT_CODE);
            frm.set_value("ACCOUNTING_UNIT_NAME", portfolioDetails.ACCOUNTING_UNIT_NAME);
            frm.set_value("PCY_CURR", portfolioDetails.PCY_CURR);
            frm.set_value("SECURITY_CURR", portfolioDetails.PCY_CURR);
        }

        const CURRENCY_MAPPING = { 
            "MAIN.LCY_CURR": CODE => frm.set_value("LCY_CURR", CODE), 
            "MAIN.GCY_CURR": CODE => frm.set_value("GCY_CURR", CODE) 
        }
        const CURRENCY_CONFIGURATIONS = await capps.rest.credbooks.static_master.read({ filter: [{ field: "MODULE_NAME", value: ["MAIN.LCY_CURR", "MAIN.GCY_CURR"], asgn: "in", type: "string" }] });
        CURRENCY_CONFIGURATIONS.map(function (currentConfig) {
            CURRENCY_MAPPING[currentConfig.MODULE_NAME] && 
            CURRENCY_MAPPING[currentConfig.MODULE_NAME](currentConfig.CODE)
        });
    },
}`