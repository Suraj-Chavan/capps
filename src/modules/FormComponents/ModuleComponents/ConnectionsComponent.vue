<template>
	<div class="connections-section">
		<h2 class="component-header mb-3 mt-2">Connections</h2>
		<div v-if="isConnectionsLoading" class="text-center my-3">
			<b-spinner small></b-spinner> Loading connections...
		</div>
		<div v-else-if="CONNECTIONS.length === 0" class="no-data-message">
			<b-icon icon="link45deg" font-scale="2" class="mb-2 text-muted" />
			<p class="text-muted mb-0">No connections available.</p>
		</div>
		<div v-else>
			<div
				v-for="connection in CONNECTIONS"
				:key="connection.name + connection.ref + connection.linked_to"
				class="connection-card"
				@click="redirectToConnections(connection)"
				tabindex="0"
				role="button"
				@keyup.enter="redirectToConnections(connection)"
			>
				<div class="connection-icon">
					<b-icon icon="link45deg" font-scale="1.1" class="text-primary"/>
				</div>
				<div class="connection-content">
					<span class="connection-name text-truncate">{{ formatConnectionName(connection) }}</span>
					<div class="connection-meta" v-if="connection.description">
						<small class="text-muted">{{ connection.description }}</small>
					</div>
					<div class="connection-count" v-if="getConnectionCount(connection)">
						<small class="badge badge-light">{{ getConnectionCount(connection) }} records</small>
					</div>
				</div>
				<div class="connection-arrow">
					<b-icon icon="chevron-right" class="text-muted" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ConnectionsMixin } from '../Mixins/ConnectionsMixin.js';

export default {
	name: 'ConnectionsComponent',
	mixins: [ConnectionsMixin],
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
		autoLoad: {
			type: Boolean,
			default: true
		},
		userFormData: {
			type: Object,
			default: () => ({})
		}
	},

	async mounted() {
		if (this.autoLoad && this.id && this.action === 'view') {
			await this.loadConnections();
		}
	}
};
</script>

<style scoped>
.connections-section {
	margin-bottom: 18px;
}

.component-header {
	font-size: 1.35rem;
	font-weight: 700;
	letter-spacing: -0.5px;
	color: #22223b;
}

.no-data-message {
	text-align: center;
	padding: 2rem 1rem;
	color: #6c757d;
}

.connection-card {
	display: flex;
	align-items: center;
	background: #f8fafc;
	border-radius: 12px;
	box-shadow: 0 1px 8px rgba(60,60,100,0.08);
	border: 1px solid #e0e7ef;
	padding: 12px 14px;
	margin-bottom: 10px;
	cursor: pointer;
	transition: box-shadow 0.2s, background 0.2s, border-color 0.2s;
	font-size: 1.05em;
	min-width: 0;
	text-decoration: none;
}

.connection-card:hover, 
.connection-card:focus {
	background: #eaf1ff;
	border-color: #3b82f6;
	box-shadow: 0 2px 12px rgba(60,60,100,0.16);
	outline: 2px solid #3b82f6;
	text-decoration: none;
	transform: translateY(-1px);
}

.connection-icon {
	margin-right: 12px;
	flex-shrink: 0;
}

.connection-content {
	flex-grow: 1;
	min-width: 0;
}

.connection-name {
	display: block;
	font-weight: 600;
	color: #2563eb;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	flex: 1;
	text-decoration: underline;
	transition: color 0.18s;
	line-height: 1.4;
}

.connection-card:hover .connection-name,
.connection-card:focus .connection-name {
	color: #1d4ed8;
	text-decoration: underline;
}

.connection-meta {
	margin-top: 4px;
}

.connection-count {
	margin-top: 6px;
}

.connection-arrow {
	margin-left: 12px;
	flex-shrink: 0;
	transition: transform 0.2s ease;
}

.connection-card:hover .connection-arrow {
	transform: translateX(2px);
}

.badge {
	font-size: 0.75rem;
	padding: 0.25rem 0.5rem;
}
</style>