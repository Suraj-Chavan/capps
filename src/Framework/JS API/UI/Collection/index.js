export default {
    get collectionName() {
        const _this = window.capps.getDependency('applicationInstance');
        const store = _this.$store;
        return store.state.CollectionBlock.collectionName;
    },
    get schema() {
        const _this = window.capps.getDependency('applicationInstance');
        const store = _this.$store;
        return store.state.CollectionBlock.collectionSchemaDetails;
    },
}