<template>
<section class="list-view">

    <CardSkeleton :dataSource="perPage" v-if="isBusy" />

    <no-data v-if="!isBusy && !localItems.length">
        <template v-slot:msg>
            <h5 class="text-muted">
                Sorry! no data found for {{ pageTitle }}
            </h5>
        </template>
	</no-data>
   
    <section class="card-grid" v-scroll v-else>
        <div class="card-container" v-for="(item, index) in localItems"  :key="`card_${index}`">
            <slot v-bind="{ item, index }" ></slot>
        </div>
    </section>    

</section>
</template>

<script>
import { scroll } from "@/directives/infiniteScrolling";

export default {
	name: "list-view",

    directives: {
		scroll: scroll,
	},

    props: {
        pageTitle: {
            type: String
        },
        perPage: {
            type: Number,
            default: 10,
	    },
        fetchData: {
            type: Function,
            required: true
        },
        sortBy: {
            type: String,
            default: ""
        },
        sortDesc: {
            type: Boolean,
            default: false
        },
        currentPage: {
            type: Number,
            default: 1,
        },
        refreshKey: {
            type: [String, Number],
            default: Date.now()
        }
    },

    data() {
		return {
            localItems: Object.freeze([]),
            isBusy: false,
		};
	},

    watch: {
        currentPage: {
            handler(newPage, oldPage) {
                if (newPage !== oldPage) {
                    this.$emit('clear:selected:filter'); // Maintain behavior of clearing filter on page change
                    this.fetchPageData(newPage);
                }
            }
        },
        perPage: {
            handler(newPerPage, oldPerPage) {
                if (newPerPage !== oldPerPage && this.currentPage) {
                    this.fetchPageData(this.currentPage);
                }
            }
        },
        refreshKey: {
            handler(newValue, oldValue) {
                if (newValue != oldValue) {
                    this.fetchPageData(this.currentPage);
                }
            }
        },
        // If fetchData prop itself could change (e.g. different API endpoint),
        // you might need to watch it and refetch.
        // fetchData: {
        //     handler() { this.fetchPageData(this.currentPage); }
        // }
    },

    methods: {
        refreshData() {
            this.localItems = Object.freeze([]);
            // Parent (Main-Screen-Layout) sets its currentPage to 1 before calling this.
            // The watcher on `this.currentPage` prop will trigger fetchPageData.
            // Or, to be more explicit if the prop might not have updated yet:
            this.fetchPageData(this.currentPage || 1);
        },
        async fetchPageData(pageToFetch) {
            if (!this.fetchData || !pageToFetch) return;

            this.isBusy = true;
            const start = (pageToFetch - 1) * this.perPage;

            try {
                const response = await this.fetchData({
                    start,
                    limit: this.perPage,
                    // sortBy and sortDesc are handled by Main-Screen-Layout's fetchData
                });
                this.localItems = Object.freeze(response || []);
                
                // Calculate pagination metrics and emit event
                const itemsOnPage = (this.localItems || []).length;
                const totalItems = ((this.localItems || [])[0] || {}).RC_INTERNAL || 0;
                let firstRecordOnPage = 0;
                let lastRecordOnPage = 0;

                if (itemsOnPage > 0) {
                    firstRecordOnPage = (pageToFetch - 1) * this.perPage + 1;
                    lastRecordOnPage = firstRecordOnPage + itemsOnPage - 1;
                }

                this.$emit('data-metrics-updated', { totalRows: totalItems, firstRecord: firstRecordOnPage, lastRecord: lastRecordOnPage });
                this.$emit("update:data:source", this.localItems);

            } catch (error) {
                console.error("Error fetching card data:", error);
                this.localItems = Object.freeze([]);
                this.$emit('data-metrics-updated', { totalRows: 0, firstRecord: 0, lastRecord: 0 }); // Emit zeroed metrics on error
                this.$emit("update:data:source", this.localItems); // Emit empty array on error
            } finally {
                this.isBusy = false;
            }
        }
    },

    mounted() {
        this.fetchPageData(this.currentPage); // Fetch initial data based on prop
    },
};
</script>

<style lang="scss" scoped>
</style>