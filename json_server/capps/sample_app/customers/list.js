module.exports = `capps.ui.customers.list = {
    // ============================================
    // COLUMN FORMATTERS
    // ============================================

    /**
     * formatters: Custom rendering for list columns
     * Transform data display in the list view
     */
    formatters: {
        STATUS: value => {
            const statusConfig = {
                'ACTIVE': {
                    color: 'success',
                    icon: '&#9679;',
                    label: 'Active'
                },
                'INACTIVE': {
                    color: 'danger',
                    icon: '&#9679;',
                    label: 'Inactive'
                },
                'PENDING': {
                    color: 'warning',
                    icon: '&#9679;',
                    label: 'Pending Approval'
                }
            };

            const config = statusConfig[value] || { color: 'secondary', icon: '&#9679;', label: value };

            return \`<span class="text-\${config.color}">
                <i style="font-size:15px;">\${config.icon}</i> \${config.label}
            </span>\`;
        },

        CUSTOMER_TYPE: value => {
            const typeIcons = {
                'INDIVIDUAL': '<i class="pi pi-user"></i>',
                'CORPORATE': '<i class="pi pi-building"></i>',
                'GOVERNMENT': '<i class="pi pi-shield"></i>'
            };

            return \`<span>\${typeIcons[value] || ''} \${value}</span>\`;
        },

        IS_VIP: value => {
            if (value === 1 || value === '1') {
                return '<span class="badge badge-warning"><i class="pi pi-star-fill"></i> VIP</span>';
            }
            return '';
        },

        CREDIT_LIMIT: value => {
            if (!value || value === 0) return '-';
            return \`₹ \${parseFloat(value).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}\`;
        },

        EMAIL: value => {
            return \`<a href="mailto:\${value}" class="text-primary">
                <i class="pi pi-envelope"></i> \${value}
            </a>\`;
        }
    },

    // ============================================
    // BULK ACTION BUTTONS (buttonList)
    // ============================================

    /**
     * buttonList: Bulk actions for selected records
     * These buttons appear in the list toolbar
     */
    buttonList: [{
        key: 'activate_customers',
        label: 'Activate',
        icon: 'pi pi-check',
        variant: 'success',
        show: () => true,
        handler: async (list) => {
            const selectedRecords = list.selectedRecords;

            if (!selectedRecords.length) {
                return capps.ui.alert({
                    message: 'Please select at least one customer to activate',
                    variant: 'warning'
                });
            }

            // Filter only pending/inactive customers
            const pendingRecords = selectedRecords.filter(
                record => record.STATUS === 'PENDING' || record.STATUS === 'INACTIVE'
            );

            if (pendingRecords.length === 0) {
                return capps.ui.alert({
                    message: 'Selected customers are already active',
                    variant: 'info'
                });
            }

            const confirm = await capps.ui.confirm({
                message: \`Activate \${pendingRecords.length} customer(s)?\`,
                size: 'md'
            });

            if (!confirm) return;

            // Update status for all selected records
            const updateData = pendingRecords.map(record => ({
                ID: record.ID,
                STATUS: 'ACTIVE'
            }));

            try {
                const response = await capps.rest.sample_app.customers.bulkedit({
                    scope: 'activate',
                    data: updateData
                });

                if (response && response.status === 'success') {
                    capps.ui.toast({
                        message: \`Successfully activated \${pendingRecords.length} customer(s)\`,
                        type: 'success'
                    });
                    capps.ui.refresh();
                } else {
                    capps.ui.alert({
                        message: response.message || 'Activation failed',
                        variant: 'danger'
                    });
                }
            } catch (error) {
                capps.ui.alert({
                    message: 'Error activating customers: ' + error.message,
                    variant: 'danger'
                });
            }
        }
    },
    {
        key: 'deactivate_customers',
        label: 'Deactivate',
        icon: 'pi pi-times',
        variant: 'danger',
        show: () => true,
        handler: async (list) => {
            const selectedRecords = list.selectedRecords;

            if (!selectedRecords.length) {
                return capps.ui.alert({
                    message: 'Please select at least one customer to deactivate',
                    variant: 'warning'
                });
            }

            const activeRecords = selectedRecords.filter(
                record => record.STATUS === 'ACTIVE'
            );

            if (activeRecords.length === 0) {
                return capps.ui.alert({
                    message: 'Selected customers are already inactive',
                    variant: 'info'
                });
            }

            const confirm = await capps.ui.confirm({
                message: \`Deactivate \${activeRecords.length} customer(s)?\`,
                size: 'md'
            });

            if (!confirm) return;

            const updateData = activeRecords.map(record => ({
                ID: record.ID,
                STATUS: 'INACTIVE'
            }));

            try {
                const response = await capps.rest.sample_app.customers.bulkedit({
                    scope: 'deactivate',
                    data: updateData
                });

                if (response && response.status === 'success') {
                    capps.ui.toast({
                        message: \`Successfully deactivated \${activeRecords.length} customer(s)\`,
                        type: 'success'
                    });
                    capps.ui.refresh();
                }
            } catch (error) {
                capps.ui.alert({
                    message: 'Error deactivating customers: ' + error.message,
                    variant: 'danger'
                });
            }
        }
    },
    {
        key: 'export_vip',
        label: 'Export VIP Customers',
        icon: 'pi pi-download',
        variant: 'warning',
        show: () => true,
        handler: async (list) => {
            try {
                // Fetch all VIP customers
                const vipCustomers = await capps.rest.sample_app.customers.read({
                    filter: [
                        { field: "IS_VIP", value: 1, asgn: "eq" }
                    ]
                });

                if (!vipCustomers || vipCustomers.length === 0) {
                    return capps.ui.alert({
                        message: 'No VIP customers found',
                        variant: 'info'
                    });
                }

                capps.ui.toast({
                    message: \`Found \${vipCustomers.length} VIP customer(s)\`,
                    type: 'success'
                });

                // Here you could trigger actual export functionality
                console.log('VIP Customers:', vipCustomers);

            } catch (error) {
                capps.ui.alert({
                    message: 'Error fetching VIP customers: ' + error.message,
                    variant: 'danger'
                });
            }
        }
    }],

    // ============================================
    // ROW ACTION BUTTONS (buttonColumns)
    // ============================================

    /**
     * buttonColumns: Individual row actions
     * These buttons appear on each row
     */
    buttonColumns: [{
        key: 'send_email',
        label: 'Send Email',
        icon: 'pi pi-envelope',
        variant: 'primary',
        show: (row) => {
            // Show only for active customers with email
            return row.STATUS === 'ACTIVE' && row.EMAIL;
        },
        handler: async (row, context) => {
            const customerEmail = row.EMAIL;
            const customerName = row.CUSTOMER_NAME;

            const confirm = await capps.ui.confirm({
                title: 'Send Email',
                message: \`Send email to \${customerName} (\${customerEmail})?\`,
                size: 'md'
            });

            if (!confirm) return;

            capps.ui.toast({
                message: \`Email would be sent to \${customerEmail}\`,
                type: 'info'
            });

            // Here you would call an RPC function to send actual email
            console.log('Sending email to:', customerEmail);
        }
    },
    {
        key: 'view_details',
        label: 'Quick View',
        icon: 'pi pi-eye',
        variant: 'info',
        show: (row) => true,
        handler: async (row, context) => {
            const customerInfo = \`
                <div class="customer-details">
                    <h5>\${row.CUSTOMER_NAME}</h5>
                    <p><strong>Type:</strong> \${row.CUSTOMER_TYPE}</p>
                    <p><strong>Status:</strong> \${row.STATUS}</p>
                    <p><strong>Email:</strong> \${row.EMAIL || 'N/A'}</p>
                    <p><strong>Phone:</strong> \${row.PHONE || 'N/A'}</p>
                    <p><strong>Credit Limit:</strong> ₹\${parseFloat(row.CREDIT_LIMIT || 0).toLocaleString('en-IN')}</p>
                    <p><strong>VIP:</strong> \${row.IS_VIP === 1 ? 'Yes' : 'No'}</p>
                </div>
            \`;

            capps.ui.open_modal({
                title: 'Customer Details',
                content: customerInfo,
                size: 'lg'
            });
        }
    },
    {
        key: 'toggle_vip',
        label: 'Toggle VIP',
        icon: 'pi pi-star',
        variant: 'warning',
        show: (row) => row.STATUS === 'ACTIVE',
        handler: async (row, context) => {
            const newVipStatus = row.IS_VIP === 1 ? 0 : 1;
            const action = newVipStatus === 1 ? 'enable' : 'disable';

            const confirm = await capps.ui.confirm({
                message: \`\${action.charAt(0).toUpperCase() + action.slice(1)} VIP status for \${row.CUSTOMER_NAME}?\`,
                size: 'md'
            });

            if (!confirm) return;

            try {
                await capps.rest.sample_app.customers.update[row.ID]({
                    data: {
                        IS_VIP: newVipStatus,
                        CREDIT_LIMIT: newVipStatus === 1 ? 100000 : row.CREDIT_LIMIT
                    }
                });

                capps.ui.toast({
                    message: \`VIP status \${action}d for \${row.CUSTOMER_NAME}\`,
                    type: 'success'
                });

                capps.ui.refresh();
            } catch (error) {
                capps.ui.alert({
                    message: 'Error updating VIP status: ' + error.message,
                    variant: 'danger'
                });
            }
        }
    }],

    // ============================================
    // ADVANCED LIST CUSTOMIZATION
    // ============================================

    /**
     * before_render: Hook to modify list data before rendering
     */
    before_render: (data) => {
        console.log('List data before rendering:', data);

        // You can modify data here before it's displayed
        return data;
    },

    /**
     * rowRenderer: Custom row rendering logic
     */
    rowRenderer: (row) => {
        // Add custom CSS class to VIP customer rows
        if (row.IS_VIP === 1) {
            return 'vip-customer-row';
        }
        return '';
    },

    /**
     * columnRowColorize: Add color coding to specific columns
     */
    columnRowColorize: {
        CREDIT_LIMIT: (value, row) => {
            if (value > 50000) {
                return 'text-success font-weight-bold';
            } else if (value > 10000) {
                return 'text-warning';
            }
            return 'text-muted';
        }
    }
}`
