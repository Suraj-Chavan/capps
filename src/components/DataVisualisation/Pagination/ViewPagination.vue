<template>
    <div
        class="view-pagination card-header d-flex pb-2 pt-1 mb-0 border-0 justify-content-between pagination-bar"
    >
        <div class="d-flex align-items-center pagination-wrapper">
            <b-pagination
                v-on:change="onPagiChange"
                ref="pagination"
                size="sm"
                align="right"
                v-model="currentPage"
                :per-page="perPage"
                :total-rows="recordDetails.totalRecord"
                class="mb-0 pagination-large-numbers"
                style="gap:1rem;"
            ></b-pagination>
            
            <!-- Go to page input -->
            <div class="goto-page-wrapper d-flex align-items-center ml-3" v-if="totalPages > 1">
                <span class="goto-page-label">Go to:</span>
                <b-form-input
                    v-model="gotoPageInput"
                    @keyup.enter="goToSpecificPage"
                    @blur="goToSpecificPage"
                    type="number"
                    :min="1"
                    :max="totalPages"
                    class="goto-page-input"
                    size="sm"
                    :placeholder="`1-${totalPages}`"
                />
                <b-button
                    @click="goToSpecificPage"
                    size="sm"
                    variant="outline-primary"
                    class="goto-page-btn"
                    :disabled="!isValidPageInput"
                >
                    Go
                </b-button>
            </div>
        </div>
        
        <span style="color: #738499; font-weight: 600;">{{ paginationLabel }}</span>
    </div>
</template>

<script>


export default {
    name : 'view-pagination',
    props: {
        value: {
            type: Number,
            default: 1
        },
        perPage: {
            type: Number,
            default: 10
        },
        callRestApi: {
            type: Function,
            required: true
        },
        initialFetch: {
            type: Boolean,
            default: true
        },
        hideIfNoData: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            localData: [],
            isBusy: false,
            firstInitialData: [],
            gotoPageInput: ''
        }
    },

    computed: {
        hide() {
            return this.localData.length
        },

        currentPage: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit("input", value)
            }
        },

        paginationLabel() {
            let label = `Showing ${this.recordDetails.fisrtRecord} - ${this.recordDetails.lastRecord}`
            if ((this.recordDetails.totalRecord == null || this.recordDetails.totalRecord == "")) return "";
            return label += ` of ${this.recordDetails.totalRecord} records`;
        },

        recordDetails() {
            let lastRecord = (this.value - 1) * this.perPage + this.perPage;
            let rc_interval = ((this.localData || [])[0] || {}).RC_INTERNAL;
            lastRecord = lastRecord > rc_interval ? rc_interval : lastRecord;
            return {
                fisrtRecord: (this.value - 1) * this.perPage + 1,
                lastRecord,
                totalRecord: rc_interval,
            };
        },
        
        totalPages() {
            return Math.ceil(this.recordDetails.totalRecord / this.perPage) || 1;
        },
        
        isValidPageInput() {
            const pageNum = parseInt(this.gotoPageInput);
            return pageNum && pageNum >= 1 && pageNum <= this.totalPages;
        },
    },

    mounted() {
        if (this.initialFetch) {
            this.onPageChanged(1);
        }
    },

    methods: {

        onPagiChange(page) {
            this.$emit("clear:selected:filter");
            this.onPageChanged(page);
        },

        refereshData() {
            this.localData = [];
            this.firstInitialData = [];
            this.currentPage = 1;
            this.onPageChanged(1);
        },

        emitLocalData() {
            this.$emit("local:data:changed", this.localData);
        },

        handleResponse(response) {
            this.isBusy = false;
            this.$set(this, 'localData', response || []);
            this.emitLocalData();
            this.$emit("busy:state", this.isBusy);
        },
        onPageChanged(page) {
            const vm = this;
            let start = ((parseInt(page) - 1) * parseInt(vm.perPage) + 1) - 1;
            vm.isBusy = true;
            vm.$emit("busy:state", vm.isBusy);
            vm.callRestApi({
                start,
                limit: vm.perPage,
                sortBy: vm.sortBy,
                sortDesc: vm.sortDesc,
            })
                .then(response => {
                    vm.handleResponse(response);
                })
                .catch(error => {
                    vm.handleResponse([]);
                    console.error(error);
                });
        },
        
        goToSpecificPage() {
            const pageNum = parseInt(this.gotoPageInput);
            
            // Validate page number
            if (!pageNum || pageNum < 1 || pageNum > this.totalPages) {
                // Clear invalid input
                this.gotoPageInput = '';
                
                // Show validation message if needed
                if (pageNum && (pageNum < 1 || pageNum > this.totalPages)) {
                    this.$bvToast.toast(`Please enter a page number between 1 and ${this.totalPages}`, {
                        title: 'Invalid Page Number',
                        variant: 'warning',
                        autoHideDelay: 3000,
                        solid: true
                    });
                }
                return;
            }
            
            // Navigate to the specified page
            this.currentPage = pageNum;
            this.gotoPageInput = ''; // Clear input after navigation
        }
    }
}
</script>
<style lang="scss" scoped>
.view-pagination {
    padding-left: 1.9rem;
    padding-right: 1.9rem;
    background: #FFF;
}

/* Enhanced pagination styling for large numbers */
:deep(.pagination-large-numbers) {
    .page-item {
        .page-link {
            min-width: 40px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px 8px;
            font-size: 13px;
            line-height: 1.2;
            border-radius: 4px;
            text-align: center;
            white-space: nowrap;
            
            /* Dynamic width based on content length */
            &:not([aria-label]) {
                min-width: max(40px, calc(1em * 2.5 + 12px));
            }
        }
        
        &.active .page-link {
            min-width: 44px;
            font-weight: 600;
            background-color: #007bff !important;
            border-color: #007bff !important;
            color: white !important;
            box-shadow: 0 2px 4px rgba(0,123,255,0.3);
        }
        
        /* Navigation buttons (arrows) */
        &:first-child .page-link,
        &:last-child .page-link,
        .page-link[aria-label*="Previous"],
        .page-link[aria-label*="Next"],
        .page-link[aria-label*="First"],
        .page-link[aria-label*="Last"] {
            min-width: 36px;
            padding: 6px 8px;
        }
    }
    
    /* Better spacing for small pagination */
    &.pagination-sm {
        gap: 0.25rem;
        
        .page-item {
            .page-link {
                min-width: 38px;
                height: 30px;
                font-size: 12px;
                padding: 4px 6px;
            }
            
            &.active .page-link {
                min-width: 42px;
            }
        }
    }
}

/* Go to page input styling */
.goto-page-wrapper {
    margin-left: 1rem;
    
    .goto-page-label {
        font-size: 13px;
        color: #6c757d;
        margin-right: 0.5rem;
        font-weight: 500;
        white-space: nowrap;
    }
    
    .goto-page-input {
        width: 70px;
        height: 32px;
        font-size: 13px;
        text-align: center;
        margin-right: 0.5rem;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        
        &:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        /* Remove spin buttons in Webkit browsers */
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        
        /* Remove spin buttons in Firefox */
        &[type=number] {
            -moz-appearance: textfield;
        }
    }
    
    .goto-page-btn {
        height: 32px;
        padding: 6px 12px;
        font-size: 13px;
        line-height: 1.2;
        border-radius: 4px;
        font-weight: 500;
        min-width: 45px;
        
        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .pagination-wrapper {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
        
        .goto-page-wrapper {
            margin-left: 0;
            
            .goto-page-label {
                font-size: 12px;
            }
            
            .goto-page-input {
                width: 60px;
                height: 30px;
                font-size: 12px;
            }
            
            .goto-page-btn {
                height: 30px;
                font-size: 12px;
                padding: 4px 10px;
                min-width: 40px;
            }
        }
    }
    
    .view-pagination {
        flex-direction: column;
        gap: 1rem;
    }
}

/* Enhanced pagination wrapper styling */
.pagination-wrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}
</style>