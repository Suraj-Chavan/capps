module.exports = `capps.ui.customers.form = {
    // ============================================
    // FORM LIFECYCLE EVENTS
    // ============================================

    /**
     * _onLoadEvent: Triggered when form is loaded
     * Use this for initializing form data, setting defaults, etc.
     */
    async _onLoadEvent(frm) {
        console.log('Form loaded for record:', current_form.ID);

        // Set field visibility based on customer type
        if (current_form.CUSTOMER_TYPE === 'INDIVIDUAL') {
            frm.make_field_invisible('CREDIT_LIMIT');
        } else {
            frm.make_field_visible('CREDIT_LIMIT');
        }

        // Make VIP customers have higher credit limit
        if (current_form.IS_VIP === 1 && !current_form.CREDIT_LIMIT) {
            frm.set_value('CREDIT_LIMIT', 100000);
        }
    },

    /**
     * _onBeforeSave: Triggered before form is saved
     * Use this for validation or data manipulation before saving
     * Throw error to prevent save operation
     */
    async _onBeforeSave(frm) {
        // Validate email format
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (current_form.EMAIL && !emailRegex.test(current_form.EMAIL)) {
            capps.ui.alert({
                title: 'Validation Error',
                message: 'Please enter a valid email address',
                variant: 'danger'
            });
            throw new Error('Invalid email format');
        }

        // Validate phone number (simple validation)
        if (current_form.PHONE && current_form.PHONE.length < 10) {
            capps.ui.alert({
                title: 'Validation Error',
                message: 'Phone number must be at least 10 digits',
                variant: 'warning'
            });
            throw new Error('Invalid phone number');
        }

        // Auto-approve VIP customers
        if (current_form.IS_VIP === 1 && current_form.STATUS === 'PENDING') {
            frm.set_value('STATUS', 'ACTIVE');
            await capps.ui.toast({
                message: 'VIP customer auto-approved',
                type: 'success'
            });
        }
    },

    /**
     * _afterFormSubmit: Triggered after successful form submission
     * Use this for post-save operations
     */
    async _afterFormSubmit(frm, response) {
        console.log('Form saved successfully:', response);

        capps.ui.toast({
            message: 'Customer record saved successfully!',
            type: 'success'
        });

        // Example: Send notification for new customers
        if (!current_form.ID || current_form.ID === 0) {
            console.log('New customer created, sending notification...');
            // You can call RPC function here to send emails, etc.
        }
    },

    // ============================================
    // FIELD CHANGE EVENTS
    // ============================================

    /**
     * CUSTOMER_TYPE field change handler
     * Updates form based on customer type selection
     */
    async CUSTOMER_TYPE(frm) {
        const customerType = current_form.CUSTOMER_TYPE;

        if (customerType === 'INDIVIDUAL') {
            frm.make_field_invisible('CREDIT_LIMIT');
            frm.set_value('CREDIT_LIMIT', 0);
        } else {
            frm.make_field_visible('CREDIT_LIMIT');

            // Set default credit limits based on type
            if (customerType === 'CORPORATE') {
                frm.set_value('CREDIT_LIMIT', 50000);
            } else if (customerType === 'GOVERNMENT') {
                frm.set_value('CREDIT_LIMIT', 100000);
            }
        }

        capps.ui.toast({
            message: \`Customer type changed to \${customerType}\`,
            type: 'info'
        });
    },

    /**
     * IS_VIP checkbox change handler
     * Adjusts credit limit for VIP customers
     */
    async IS_VIP(frm) {
        if (current_form.IS_VIP === 1) {
            const currentLimit = parseFloat(current_form.CREDIT_LIMIT || 0);
            const newLimit = Math.max(currentLimit, 100000);

            frm.set_value('CREDIT_LIMIT', newLimit);

            await capps.ui.toast({
                message: 'VIP status enabled - Credit limit increased',
                type: 'success'
            });
        }
    },

    /**
     * EMAIL field change handler
     * Validates email in real-time
     */
    async EMAIL(frm) {
        const email = current_form.EMAIL;

        if (!email) return;

        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

        if (!emailRegex.test(email)) {
            capps.ui.toast({
                message: 'Please enter a valid email address',
                type: 'warning'
            });
        } else {
            // Check if email already exists
            try {
                const existingCustomers = await capps.rest.sample_app.customers.read({
                    filter: [
                        { field: "EMAIL", value: email, asgn: "eq" }
                    ]
                }, { loader: false });

                if (existingCustomers && existingCustomers.length > 0) {
                    // If editing, ignore current record
                    const isDuplicate = existingCustomers.some(c => c.ID !== current_form.ID);

                    if (isDuplicate) {
                        capps.ui.alert({
                            title: 'Duplicate Email',
                            message: 'This email address is already registered',
                            variant: 'warning'
                        });
                    }
                }
            } catch (error) {
                console.error('Error checking email:', error);
            }
        }
    },

    /**
     * COUNTRY field change handler
     * Auto-populate postal code format hint
     */
    async COUNTRY(frm) {
        const country = current_form.COUNTRY;

        const postalCodeFormats = {
            'IN': 'Format: 123456 (6 digits)',
            'US': 'Format: 12345 or 12345-6789',
            'UK': 'Format: SW1A 1AA',
            'CA': 'Format: K1A 0B1'
        };

        const format = postalCodeFormats[country] || '';

        if (format) {
            capps.ui.toast({
                message: \`Postal code \${format}\`,
                type: 'info'
            });
        }
    },

    // ============================================
    // CUSTOM BUTTON HANDLERS
    // ============================================

    /**
     * Custom button: Verify Customer
     * Demonstrates custom button functionality
     */
    buttonList: [{
        key: 'verify_customer',
        label: 'Verify Customer',
        icon: 'pi pi-check-circle',
        show: () => {
            // Show button only for pending customers
            return current_form.STATUS === 'PENDING';
        },
        handler: async (frm) => {
            const confirm = await capps.ui.confirm({
                title: 'Verify Customer',
                message: 'Are you sure you want to verify this customer?',
                size: 'md'
            });

            if (!confirm) return;

            // Update status to active
            frm.set_value('STATUS', 'ACTIVE');

            // Save the form
            await frm.save();

            capps.ui.toast({
                message: 'Customer verified and activated successfully!',
                type: 'success'
            });
        }
    }],

    /**
     * _formUtilities: Additional utility functions
     * Can be called from other event handlers
     */
    _formUtilities: {
        validateCreditLimit: function(limit) {
            const maxLimit = 1000000;
            return limit <= maxLimit;
        },

        formatPhoneNumber: function(phone) {
            // Remove all non-numeric characters
            return phone.replace(/\\D/g, '');
        }
    }
}`
