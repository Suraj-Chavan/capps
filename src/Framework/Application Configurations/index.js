export const application = {
    get configurations() {
        const _this = window.capps.getDependency('applicationInstance');
        const store = _this.$store;
        return store.state.ModuleBlock.moduleConfigurations;
    },
};