module.exports = `capps.ui.forex.list = {
CustomAction: async function (list) {
        // Get selected records
        const selectedRecords = list.selectedRecords;
        
        // Add custom HTML
        list.add_html("customContainer", "<div class='btn btn-primary'>aa Custom Content</div>");
        
    },
    formatters: {
        STATUS: value => {
            if (value === "Activated") {
                return '<span class="text-success"><i style="font-size:15px;">&#9679;</i> Activated</span>';
            } else if (value === "Pending") {
                return '<span class="text-warning"><i style="font-size:15px;">&#9679;</i> Pending</span>';
            } else {
                return '<span class="text-danger"><i style="font-size:15px;">&#9679;</i> Inactive</span>';
            }
        }
    },

    Activate: async function (list) {
        const selectedRecords = list.selectedRecords;

        if (!selectedRecords.length) {
            return capps.ui.alert({
                message: "Please select at least one record to authorise.",
                size: "md",
                variant: "danger",
            });
        }

        let confirm = await capps.ui.confirm({
            message: "Are you sure you want to authorise the selected records?",
            size: "md",
        });

        if (!confirm) return;

        const SELECTED_RECORDS = selectedRecords.reduce((acc, record) => {
            if (record.AUTHORISED === "N") {
                acc.NON_AUTHORIZED_RECORDS.push({ ID: record.ID, AUTHORISED: "Y" });
                return acc;
            }
            acc.AUTHORIZED_RECORDS.push({ ID: record.ID, AUTHORISED: record.AUTHORISED });
            return acc;
        }, {
            NON_AUTHORIZED_RECORDS: [],
            AUTHORIZED_RECORDS: [],
        });

        if(SELECTED_RECORDS.AUTHORIZED_RECORDS.length > 0) {
            confirm = await capps.ui.confirm({
                message: "Some authorised records have been chosen; authorisation will still proceed without these records. Would you like to proceed?",
                size: "md",
            });
            if(!confirm) return;
        }

        if(SELECTED_RECORDS.NON_AUTHORIZED_RECORDS.length === 0) {
            return await capps.ui.alert({
                // title: "Alert!!!",
                message: "Only non-authorised records will be marked as authorised.",
                variant: "info",
                size: "md",
            });
        }

        const response = await capps.rest.credbooks.accounting_entries_mast.bulkedit({
            scope: "authorise",
            data: SELECTED_RECORDS.NON_AUTHORIZED_RECORDS,
        });

        if (response && response.status == "unsuccess") {
            return capps.ui.alert({
                // title: "Alert!!!",
                message: response.error || response.message || response.msg || "Something went wrong.",
                variant: "danger",
                size: "md",
            });
        }

        if (response && response.status == "success") {
            return capps.ui.toast({
                // title: "Success",
                message: response.msg || response.message || response.error || "",
                variant: 'success',
                size: "md",
            });
        }

        capps.ui.toast({
            title: "Success!",
            message: response.msg || response.message || response.error || " ",
            variant: 'success',
            size: "md",
        });
    },
    Inactivate: async function (list) {
        const selectedRecords = list.selectedRecords;

        if (!selectedRecords.length) {
            return capps.ui.alert({
                message: "Please select at least one record to unauthorise.",
                size: "md",
                variant: "danger",
            });
        }

        let confirm = await capps.ui.confirm({
            message: "Are you sure you want to unauthorise the selected records?",
            size: "md",
        });

        if (!confirm) return;

        const SELECTED_RECORDS = selectedRecords.reduce((acc, record) => {
            if (record.AUTHORISED === "Y") {
                acc.AUTHORIZED_RECORDS.push({ ID: record.ID, AUTHORISED: "N" });
                return acc;
            }
            acc.NON_AUTHORIZED_RECORDS.push({ ID: record.ID, AUTHORISED: record.AUTHORISED });
            return acc;
        }, {
            NON_AUTHORIZED_RECORDS: [],
            AUTHORIZED_RECORDS: [],
        });

        if(SELECTED_RECORDS.NON_AUTHORIZED_RECORDS.length > 0) {
            confirm = await capps.ui.confirm({
                message: "Some unauthorised records have been chosen; unauthorisation will still proceed without these records. Would you like to proceed?",
                size: "md",
            });
            if(!confirm) return;
        }

        if(SELECTED_RECORDS.AUTHORIZED_RECORDS.length === 0) {
            return await capps.ui.alert({
                // title: "Alert!!!",
                message: "Only authorised records will be marked as unauthorised.",
                variant: "info",
                size: "md",
            });
        }

        const response = await capps.rest.credbooks.accounting_entries_mast.bulkedit({
            scope: "unauthorise",
            data: SELECTED_RECORDS.AUTHORIZED_RECORDS,
        });

        if (response && response.status == "unsuccess") {
            return capps.ui.alert({
                // title: "Alert!!!",
                message: response.error || response.message || response.msg || "Something went wrong.",
                variant: "danger",
                size: "md",
            });
        }

        if (response && response.status == "success") {
            return capps.ui.toast({
                // title: "Success",
                message: response.msg || response.message || response.error || "",
                variant: 'success',
                size: "md",
            });
        }

        capps.ui.toast({
            title: "Success!",
            message: response.msg || response.message || response.error || " ",
            variant: 'success',
            size: "md",
        });
    },
}`
 
