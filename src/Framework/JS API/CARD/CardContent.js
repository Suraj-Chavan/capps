import featureFormatters from "@/modules/CAPPS/CollectionDetails/ListJsFeatures/BootstrapTable/FORMATTERS.js";

export default ({ template, style, listJs }) => {
    const features = listJs?.features || {};
    return {
        template: `
            <div
                class="cred__capps-card--content"
            >
                <div class="card-standard-card-selector">
                    <slot name="checkbox:container" v-bind="{ doc }"></slot>
                </div>

                ${template}

                <div class="card-standard-actions-container">
                    <slot name="standard-actions"></slot>
                </div>
            </div>
        `,
        props: {
            record: {
                type: Object,
                required: true,
            }
        },
        computed: {
            doc() {
                const record = this.record;
                return new Proxy({}, {
                    get: (target, fieldName) => {
                        const fieldConfig = { [fieldName]: record[fieldName] };
                        featureFormatters({ features, fieldName, fieldConfig });
                        if(typeof fieldConfig.formatter === "function") {
                            return fieldConfig.formatter(record[fieldName], record);
                        }
                        return record[fieldName];
                    }
                })
            }
        },
    };
};
