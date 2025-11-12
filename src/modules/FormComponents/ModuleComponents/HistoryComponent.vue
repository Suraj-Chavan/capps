<template>
	<div class="version-history-section">
		<div class="version-history-header mb-3" v-if="audit_id">
			<span
				class="current-version-chip"
				@click="openAuditFormData(null)"
				tabindex="0"
				role="button"
				@keyup.enter="openAuditFormData(null)"
			>
				<b-icon icon="b-icon-arrow-left" /> Current Version
			</span>
		</div>
		
		<div v-if="isAuditLogsLoading" class="text-center">
			<b-spinner small></b-spinner> Loading history...
		</div>
		
		<div v-if="!AUDIT_LOGS.length && !isAuditLogsLoading" class="no-data-message">
			<b-icon icon="clock-history" font-scale="2" class="mb-2 text-muted" />
			<p class="text-muted mb-0">There is no history to display.</p>
		</div>
		
		<div class="version-timeline" v-if="AUDIT_LOGS.length > 0">
			<div
				v-for="(log) in AUDIT_LOGS"
				:key="log.SR_NO + log.SYS_AUDIT_ID"
				class="version-card"
				:class="{ 'current-version': isCurrentVersion(log) }"
				@click="openAuditFormData(log)"
				tabindex="0"
				role="button"
				@keyup.enter="openAuditFormData(log)"
			>
				<div
					class="version-icon"
					:class="{
						'create': (log.SYS_OPERATION || '').toLowerCase() === 'create',
						'update': (log.SYS_OPERATION || '').toLowerCase() === 'update',
						'delete': (log.SYS_OPERATION || '').toLowerCase() === 'delete'
					}"
				>
					{{ (log.SYS_OPERATION || '').charAt(0).toUpperCase() }}
				</div>
				
				<div class="version-content">
					<div class="version-date">
						{{ formatDate(log.SYS_AUDITDATE) }}
					</div>
					<div class="version-meta">
						by {{ log.SYS_USERID }} for {{ log.SYS_OPERATION }}
					</div>
				</div>
				
			</div>
		</div>
	</div>
</template>

<script>
import { HistoryMixin } from '../Mixins/HistoryMixin.js';

export default {
	name: 'HistoryComponent',
	mixins: [HistoryMixin],
	props: {
		id: {
			type: [String, Number],
			required: true
		},
		collection: {
			type: String,
			required: true
		},
		moduleName: {
			type: String,
			required: true
		},
		action: {
			type: String,
			default: 'view'
		},
		audit_id: {
			type: [String, Number],
			default: null
		},
		autoLoad: {
			type: Boolean,
			default: true
		}
	},

	async mounted() {
		if (this.autoLoad && this.id && (this.action === 'view' || this.action === 'update')) {
			await this.loadAuditsData();
		}
	},

	methods: {
		// Component-specific methods can be added here if needed
	}
};
</script>

<style scoped>
.version-history-section {
	margin-bottom: 18px;
}

.component-header {
	font-size: 1.35rem;
	font-weight: 700;
	letter-spacing: -0.5px;
	color: #22223b;
}

.version-history-header {
	display: inline-flex;
	align-items: center;
	gap: 40px;
	flex-wrap: wrap;
}

.no-data-message {
	text-align: center;
	padding: 2rem 1rem;
	color: #6c757d;
}

.current-version-chip {
	background: #1e293b;
	color: #fff;
	font-weight: 600;
	border-radius: 999px;
	padding: 2px 10px 2px 8px;
	font-size: 0.9rem;
	box-shadow: 0 1px 6px rgba(30,41,59,0.08);
	margin-left: 8px;
	cursor: pointer;
	display: flex;
	align-items: center;
	height: 28px;
	line-height: 1.2;
	white-space: nowrap;
	transition: background 0.18s, box-shadow 0.18s;
	outline: none;
	border: none;
}

.current-version-chip:hover, 
.current-version-chip:focus {
	background: #0f172a;
	color: #fff;
	box-shadow: 0 2px 12px rgba(30,41,59,0.16);
	text-decoration: none;
}

.current-version-chip .b-icon {
	margin-right: 6px;
	font-size: 1.1em;
	vertical-align: middle;
}

.version-card {
	display: flex;
	align-items: flex-start;
	background: #f8fafc;
	border-radius: 12px;
	box-shadow: 0 1px 8px rgba(60,60,100,0.08);
	border: 1px solid #e0e7ef;
	padding: 14px 14px 10px 14px;
	margin-bottom: 12px;
	cursor: pointer;
	transition: box-shadow 0.2s, background 0.2s, border-color 0.2s;
}

.version-card:hover, 
.version-card:focus {
	background: #eaf1ff;
	box-shadow: 0 2px 12px rgba(60,60,100,0.16);
	border-color: #3b82f6;
	outline: 2px solid #3b82f6;
}

.version-card.current-version {
	border-color: #28a745;
	background: #f8fff9;
}

.version-icon {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	font-weight: 700;
	font-size: 1.3em;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 14px;
	flex-shrink: 0;
	background: #ffe7b2; /* default yellow */
	color: #eab308;      /* default yellow text */
}

.version-icon.create {
	background: #d1fae5; /* light green */
	color: #059669;      /* green */
}

.version-icon.update {
	background: #fef9c3; /* light yellow */
	color: #eab308;      /* yellow */
}

.version-icon.delete {
	background: #fee2e2; /* light red */
	color: #dc2626;      /* red */
}

.version-content {
	flex: 1;
	min-width: 0;
}

.version-content .version-date {
	font-weight: 600;
	color: #22223b;
	font-size: 1em;
	margin-bottom: 2px;
	word-break: break-word;
}

.version-content .version-meta {
	font-size: 0.95em;
	color: #6c757d;
	margin-bottom: 0;
	word-break: break-word;
}

</style>