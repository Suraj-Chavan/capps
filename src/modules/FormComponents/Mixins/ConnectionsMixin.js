import capps from "capps";

export const ConnectionsMixin = {
	data() {
		return {
			isConnectionsLoading: false,
			CONNECTIONS: []
		};
	},

	methods: {
		async loadConnections() {
			if (!this.id || this.isConnectionsLoading) return;
			
			this.isConnectionsLoading = true;
			try {
				const CONNECTIONS = await capps.rest[this.moduleName][this.collection].meta({}, { loader: false });
				this.CONNECTIONS = this.convertConnections(CONNECTIONS, this.userFormData || {});
			} catch (error) {
				console.error('Error loading connections:', error);
				this.CONNECTIONS = [];
			} finally {
				this.isConnectionsLoading = false;
			}
		},

		convertConnections(connections, userFormData) {
			if (!connections) return [];
			
			return Object.entries(connections)
				.reduce((acc, [collection, connectionsList]) => {
					// Process each connection in the collection
					const collectionConnections = connectionsList.map(connection => ({
						name: connection.name,
						collection: collection,
						linked_to: connection.linked_to,
						ref: connection.ref,
						filter: {
							[connection.linked_to]: userFormData[connection.ref]
						}
					}));

					return [...acc, ...collectionConnections];
				}, []);
		},

		async ensureConnectionsLoaded() {
			if (this.action === 'view' && this.id && this.CONNECTIONS.length === 0 && !this.isConnectionsLoading) {
				await this.loadConnections();
			}
		},

		redirectToConnections(connection) {
			if (!connection || !connection.collection) return;
			
			// Navigate to the connection's collection with the filter
			this.$router.push(`/${this.moduleName}/doc/${connection.collection}/view/list?filter=${JSON.stringify(connection.filter)}`);
		},

		getConnectionCount(connection) {
			// If connection has a count property, use it
			if (connection.count !== undefined) {
				return connection.count;
			}
			
			// Otherwise, try to estimate from filter or return empty
			return '';
		},

		formatConnectionName(connection) {
			// Format connection display name
			if (connection.display_name) {
				return connection.display_name;
			}
			
			if (connection.name) {
				return connection.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
			}
			
			return 'Unknown Connection';
		}
	}
};