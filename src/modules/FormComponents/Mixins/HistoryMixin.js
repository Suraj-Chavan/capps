import capps from "capps";
import moment from "moment";
import { globalDateFormatLong } from "config";

export const HistoryMixin = {
	data() {
		return {
			isAuditLogsLoading: false,
			AUDIT_LOGS: [],
			differences: {}
		};
	},

	methods: {
		async loadAuditsData() {
			if (!this.id || this.isAuditLogsLoading) return;

			this.isAuditLogsLoading = true;
			this.AUDIT_LOGS = []; // Clear previous logs before fetching new ones
			try {
				const auditData = await capps.rest[this.moduleName][this.collection].read({
					is_audit: true,
					filter: [
						{ field: "ID", asgn: "eq", value: this.id },
						{ field: "SYS_AUDIT_ID", asgn: "noteq", value: "1" },
					],
					page: { start: "0", limit: 50 },
				}, { loader: false });
				if (auditData.status !== "unsuccess" && Array.isArray(auditData)) {
					this.AUDIT_LOGS = auditData;

					// Calculate field differences after loading audit logs if audit_id exists
					if (this.$route.params.audit_id) {
						this.$nextTick(() => {
							this.calculateFieldDifferences();
						});
					}
				} else {
					// console.warn("No audit logs found or error fetching:", auditData);
				}
			} catch (error) {
				console.error('Error loading audit logs:', error);
			} finally {
				this.isAuditLogsLoading = false;
			}
		},

		async ensureAuditLogsLoaded() {
			if ((this.action === 'view' || this.action === 'update') && this.id && this.AUDIT_LOGS.length === 0 && !this.isAuditLogsLoading) {
				await this.loadAuditsData();
			}
		},

		calculateFieldDifferences(AUDIT_LOGS = this.AUDIT_LOGS) {
			console.log('calculateFieldDifferences called', {
				AUDIT_LOGS_length: AUDIT_LOGS?.length,
				audit_id: this.$route.params.audit_id
			});

			if (!AUDIT_LOGS || AUDIT_LOGS.length == 0) {
				console.warn('No AUDIT_LOGS available');
				return;
			}

			const audit_id = this.$route.params.audit_id;
			const current = AUDIT_LOGS.findIndex(log => log.SYS_AUDIT_ID === audit_id);

			console.log('Current version index:', current);

			// Compare all fields
			const currentData = AUDIT_LOGS[current];
			const previousData = AUDIT_LOGS[current + 1];

			console.log('Data comparison:', { currentData, previousData });

			// Clear old diff classes first
			this.clearDiffClassesFromFields();

			// Compare all fields
			if (!previousData) {
				console.warn('No previous data to compare');
				this.differences = {}
				return;
			};
			let differences = {};
			Object.keys(currentData).forEach(key => {
				if (currentData[key] !== previousData[key]) {
					differences[key] = {
						previous: previousData[key],
						current: currentData[key],
						type: 'modified'
					};
				}
			});
			this.differences = differences;

			console.log('Calculated differences:', differences);
			console.log('Number of differences:', Object.keys(differences).length);

			// Apply new diff classes to FIELDS
			this.applyDiffClassesToFields();
		},

		applyDiffClassesToFields() {
			const FIELDS = this.collectionSchemaDetails?.FIELDS;
			if (!FIELDS || !this.differences) {
				console.warn('Cannot apply diff classes - FIELDS or differences not available');
				return;
			}

			const differencesArray = Object.keys(this.differences);
			console.log('Applying diff classes to fields:', differencesArray);

			differencesArray.forEach(field => {
				if (FIELDS[field]) {
					// Use Vue.set to make it reactive
					this.$set(FIELDS[field], 'class', `diff-${this.differences[field].type}`);
					console.log(`Applied diff class to ${field}:`, FIELDS[field].class);
				} else {
					console.log(`Field ${field} not in schema (system field)`);
				}
			});

			console.log('Diff classes applied, forcing re-render');
		},

		clearDiffClassesFromFields() {
			const FIELDS = this.collectionSchemaDetails?.FIELDS;
			if (!FIELDS) {
				console.warn('Cannot clear diff classes - FIELDS not available');
				return;
			}

			console.log('Clearing diff classes from all fields');
			Object.keys(FIELDS).forEach(fieldName => {
				if (FIELDS[fieldName].class && FIELDS[fieldName].class.startsWith('diff-')) {
					this.$delete(FIELDS[fieldName], 'class');
					console.log(`Cleared diff class from ${fieldName}`);
				}
			});

			console.log('Diff classes cleared');
		},

		openAuditFormData(log) {
			if (!log) {
				// Navigate to current version
				// Check query param 'fromAction' to determine where to return
				const fromAction = this.$route.query.fromAction;
				let routeAction = fromAction === 'update' ? 'update' : 'view_record';

				// If no query param, fall back to checking current action
				if (!fromAction && this.action === 'update') {
					routeAction = 'update';
				}

				this.$router.push(
					`/${this.moduleName}/doc/${this.collection}/${routeAction}/${this.id}`
				);
			} else {
				// Navigate to specific audit version - always view_record (read-only)
				// Pass the current action as query param to remember where we came from
				const fromAction = this.action;

				this.$router.push({
					path: `/${this.moduleName}/doc/${this.collection}/view_record/${this.id}/${log.SYS_AUDIT_ID || ""}`,
					query: { fromAction }
				});
			}
			// Note: Field differences will be calculated automatically by InputForm's route watcher
		},

		formatDate(date) {
			if (!date) return '';
			return moment(date, globalDateFormatLong)
				.format('MMMM Do dddd YYYY, h:mm:ss');
		},

		formatTime(date) {
			if (!date) return '';
			// HH:MM AM/PM
			return moment(date, globalDateFormatLong).format('h:mm A');
		},

		getAuditActionIcon(action) {
			const iconMap = {
				'CREATE': 'plus-circle',
				'UPDATE': 'pencil-square', 
				'DELETE': 'trash',
				'AUTHORIZE': 'check-circle',
				'UNAUTHORIZE': 'x-circle'
			};
			return iconMap[action] || 'clock-history';
		},

		getAuditActionColor(action) {
			const colorMap = {
				'CREATE': 'success',
				'UPDATE': 'primary',
				'DELETE': 'danger', 
				'AUTHORIZE': 'success',
				'UNAUTHORIZE': 'warning'
			};
			return colorMap[action] || 'secondary';
		},

		isCurrentVersion(log) {
			return this.$route.params.audit_id === log.SYS_AUDIT_ID;
		},

		hasFieldChanged(fieldName) {
			return this.differences && this.differences[fieldName];
		},

		getFieldChange(fieldName) {
			if (!this.hasFieldChanged(fieldName)) return null;
			return this.differences[fieldName];
		}
	}
};