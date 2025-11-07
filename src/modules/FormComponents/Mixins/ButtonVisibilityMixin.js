/**
 * ButtonVisibilityMixin.js
 *
 * Manages button visibility state with support for:
 * - Auto-evaluated visibility (reactive to form data changes via show() functions)
 * - Manual visibility control (user explicitly hides/shows buttons)
 * - Future extensibility for permission-based, conditional, etc.
 *
 * @mixin ButtonVisibilityMixin
 */

const VISIBILITY_CONTROL_TYPES = {
	AUTO: 'auto',       // Visibility controlled by show() function, re-evaluates on data changes
	MANUAL: 'manual',   // Visibility explicitly set by user via API calls, persists across data changes
	// Future: PERMISSION: 'permission', CONDITIONAL: 'conditional', etc.
};

export default {
	data() {
		return {
			/**
			 * Central state for button visibility
			 * Structure: { [buttonKey]: { visible: boolean, control: 'auto'|'manual' } }
			 */
			buttonVisibilityState: {},

			/**
			 * Store for dynamically added buttons
			 */
			dynamicButtons: [],

			/**
			 * Store for grouped buttons (for dropdown rendering)
			 */
			buttonGroups: {},
		};
	},

	computed: {
		/**
		 * Returns only visible ungrouped buttons
		 * Grouped buttons are stored separately in buttonGroups
		 */
		visibleButtons() {
			const allButtons = this.buttonList.filter(button =>
				this.buttonVisibilityState[button.key]?.visible === true
			);

			// Separate ungrouped and grouped buttons
			const grouped = allButtons.reduce((acc, button) => {
				if (button.group) {
					if (!acc.grouped[button.group]) {
						acc.grouped[button.group] = [];
					}
					acc.grouped[button.group].push(button);
				} else {
					acc.ungrouped.push(button);
				}
				return acc;
			}, { ungrouped: [], grouped: {} });

			// Store grouped buttons for template access
			this.buttonGroups = grouped.grouped;

			return grouped.ungrouped;
		},
	},

	methods: {
		// ==================== CORE VISIBILITY MANAGEMENT ====================

		/**
		 * Sets button visibility with control type tracking
		 * @private
		 * @param {string} buttonKey - Unique button identifier
		 * @param {boolean} visible - Visibility state
		 * @param {string} controlType - How visibility is controlled ('auto' or 'manual')
		 */
		_setButtonVisibility(buttonKey, visible, controlType = VISIBILITY_CONTROL_TYPES.AUTO) {
			this.$set(this.buttonVisibilityState, buttonKey, {
				visible: Boolean(visible),
				control: controlType
			});
		},

		/**
		 * Determines if button visibility should be re-evaluated
		 * @private
		 * @param {string} buttonKey - Unique button identifier
		 * @returns {boolean} True if button should be re-evaluated
		 */
		_shouldReevaluateButton(buttonKey) {
			const state = this.buttonVisibilityState[buttonKey];
			// Re-evaluate if no state exists OR if control type is 'auto'
			return !state || state.control === VISIBILITY_CONTROL_TYPES.AUTO;
		},

		/**
		 * Evaluates visibility for a single button based on its show() function
		 * @private
		 * @param {Object} button - Button configuration object
		 * @returns {Promise<boolean>} Visibility state
		 */
		async _evaluateButtonVisibility(button) {
			if (typeof button.show === 'function') {
				try {
					return await button.show();
				} catch (error) {
					console.warn(`[ButtonVisibility] Error evaluating show() for button "${button.key}":`, error);
					return false;
				}
			}
			// Default to visible unless explicitly set to false
			return button.show !== false;
		},

		/**
		 * Finds a button by label and optional group
		 * @private
		 * @param {string} label - Button label
		 * @param {string|null} group - Button group (optional)
		 * @returns {Object|null} Button object or null if not found
		 */
		_findButton(label, group = null) {
			// Search in both static and dynamic buttons
			return this.buttonList.find(btn => {
				const labelMatch = btn.label === label;
				const groupMatch = group ? btn.group === group : true;
				return labelMatch && groupMatch;
			});
		},

		/**
		 * Cleans up visibility state for removed button
		 * @private
		 * @param {string} buttonKey - Unique button identifier
		 */
		_cleanupButtonVisibility(buttonKey) {
			this.$delete(this.buttonVisibilityState, buttonKey);
		},

		// ==================== PUBLIC API ====================

		/**
		 * Initializes visibility for all buttons
		 * Re-evaluates only 'auto' controlled buttons, preserves 'manual' settings
		 * @public
		 */
		async initializeButtonVisibility() {
			console.log('[ButtonVisibility] Initializing button visibility...');
			console.log('[ButtonVisibility] buttonList:', this.buttonList);
			console.log('[ButtonVisibility] current_form:', window.current_form);

			for (const button of this.buttonList) {
				if (this._shouldReevaluateButton(button.key)) {
					// Re-evaluate auto-controlled buttons
					const visible = await this._evaluateButtonVisibility(button);
					this._setButtonVisibility(button.key, visible, VISIBILITY_CONTROL_TYPES.AUTO);
					console.log(`[ButtonVisibility] Button "${button.key}" visibility (auto):`, visible);
				} else {
					// Keep existing manual control
					const state = this.buttonVisibilityState[button.key];
					console.log(`[ButtonVisibility] Button "${button.key}" visibility (manual):`, state.visible);
				}
			}

			console.log('[ButtonVisibility] Final visibility state:', this.buttonVisibilityState);
		},

		/**
		 * Adds a custom button dynamically
		 * @public
		 * @param {Object} buttonConfig - Button configuration
		 */
		async addCustomButton(buttonConfig) {
			const existingIndex = this.dynamicButtons.findIndex(btn => btn.key === buttonConfig.key);

			if (existingIndex !== -1) {
				// Update existing button
				this.$set(this.dynamicButtons, existingIndex, buttonConfig);
			} else {
				// Add new button
				this.dynamicButtons.push(buttonConfig);
			}

			// Set initial visibility
			const visible = await this._evaluateButtonVisibility(buttonConfig);
			this._setButtonVisibility(buttonConfig.key, visible, VISIBILITY_CONTROL_TYPES.AUTO);
		},

		/**
		 * Removes/hides a button (manual control)
		 * For dynamic buttons: removes from list
		 * For static buttons: sets visibility to false with manual control
		 * @public
		 * @param {string} label - Button label
		 * @param {string|null} group - Button group (optional)
		 * @returns {boolean} True if button was found and removed/hidden
		 */
		removeCustomButton(label, group = null) {
			// Try to remove from dynamic buttons
			const dynamicButtonIndex = this.dynamicButtons.findIndex(btn => {
				const labelMatch = btn.label === label;
				const groupMatch = group ? btn.group === group : true;
				return labelMatch && groupMatch && btn._isDynamic;
			});

			if (dynamicButtonIndex !== -1) {
				const removedButton = this.dynamicButtons[dynamicButtonIndex];
				this.dynamicButtons.splice(dynamicButtonIndex, 1);
				this._cleanupButtonVisibility(removedButton.key);
				console.log(`[ButtonVisibility] Removed dynamic button: ${label}${group ? ' from group: ' + group : ''}`);
				return true;
			}

			// For static buttons, hide with manual control
			const button = this._findButton(label, group);
			if (button) {
				this._setButtonVisibility(button.key, false, VISIBILITY_CONTROL_TYPES.MANUAL);
				console.log(`[ButtonVisibility] Hidden button (manual): ${label}${group ? ' from group: ' + group : ''}`);
				return true;
			}

			console.warn(`[ButtonVisibility] Button not found: ${label}${group ? ' in group: ' + group : ''}`);
			return false;
		},

		/**
		 * Shows a previously hidden button (manual control)
		 * @public
		 * @param {string} label - Button label
		 * @param {string|null} group - Button group (optional)
		 * @returns {boolean} True if button was found and shown
		 */
		showCustomButton(label, group = null) {
			const button = this._findButton(label, group);

			if (button) {
				this._setButtonVisibility(button.key, true, VISIBILITY_CONTROL_TYPES.MANUAL);
				console.log(`[ButtonVisibility] Showed button (manual): ${label}${group ? ' from group: ' + group : ''}`);
				return true;
			}

			console.warn(`[ButtonVisibility] Button not found: ${label}${group ? ' in group: ' + group : ''}`);
			return false;
		},

		/**
		 * Clears all or group-specific custom buttons
		 * @public
		 * @param {string|null} group - Group name (optional, null = all buttons)
		 * @returns {number} Number of buttons cleared
		 */
		clearCustomButtons(group = null) {
			let removedCount = 0;

			if (group) {
				// Remove dynamic buttons from specific group
				const buttonsToRemove = this.dynamicButtons.filter(btn => btn.group === group && btn._isDynamic);
				buttonsToRemove.forEach(btn => {
					const index = this.dynamicButtons.indexOf(btn);
					this.dynamicButtons.splice(index, 1);
					this._cleanupButtonVisibility(btn.key);
					removedCount++;
				});

				// Hide static buttons from specific group with manual control
				const formConfig = window.capps?.ui?.[this.collection]?.form || {};
				const staticButtons = formConfig.buttonList || [];
				staticButtons.forEach(btn => {
					if (btn.group === group) {
						this._setButtonVisibility(btn.key, false, VISIBILITY_CONTROL_TYPES.MANUAL);
						removedCount++;
					}
				});

				console.log(`[ButtonVisibility] Cleared ${removedCount} buttons from group: ${group}`);
			} else {
				// Remove all dynamic buttons
				const dynamicButtonKeys = this.dynamicButtons
					.filter(btn => btn._isDynamic)
					.map(btn => btn.key);

				this.dynamicButtons = this.dynamicButtons.filter(btn => !btn._isDynamic);

				dynamicButtonKeys.forEach(key => {
					this._cleanupButtonVisibility(key);
					removedCount++;
				});

				// Hide all static buttons with manual control
				const formConfig = window.capps?.ui?.[this.collection]?.form || {};
				const staticButtons = formConfig.buttonList || [];
				staticButtons.forEach(btn => {
					this._setButtonVisibility(btn.key, false, VISIBILITY_CONTROL_TYPES.MANUAL);
					removedCount++;
				});

				console.log(`[ButtonVisibility] Cleared ${removedCount} total custom buttons`);
			}

			return removedCount;
		},

		/**
		 * Changes button type/class for dynamic buttons only
		 * @public
		 * @param {string} label - Button label
		 * @param {string} buttonType - Button type/class
		 * @param {string|null} group - Button group (optional)
		 * @returns {boolean} True if button type was changed
		 */
		changeCustomButtonType(label, buttonType, group = null) {
			const dynamicButton = this.dynamicButtons.find(btn => {
				const labelMatch = btn.label === label;
				const groupMatch = group ? btn.group === group : true;
				return labelMatch && groupMatch && btn._isDynamic;
			});

			if (dynamicButton) {
				const buttonTypeClasses = {
					primary: 'capps-btn-primary',
					secondary: 'capps-btn-secondary',
					success: 'capps-btn-success',
					danger: 'capps-btn-danger',
					warning: 'capps-btn-warning',
					info: 'capps-btn-info',
					light: 'capps-btn-light',
					dark: 'capps-btn-dark'
				};

				dynamicButton.class = buttonTypeClasses[buttonType] || buttonType;
				console.log(`[ButtonVisibility] Changed button type: ${label} to ${buttonType}`);
				return true;
			}

			// Static buttons cannot be modified
			const button = this._findButton(label, group);
			if (button && !button._isDynamic) {
				console.warn(`[ButtonVisibility] Cannot change type of static button: ${label}. Modify form configuration instead.`);
				return false;
			}

			console.warn(`[ButtonVisibility] Button not found: ${label}${group ? ' in group: ' + group : ''}`);
			return false;
		},
	},
};
