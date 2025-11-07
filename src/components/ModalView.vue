<template>
	<div class="modal-route">
		{{ requiredFieldsText }}
		<div class="modal in" style="opacity: 1; display: block">
			<div
				class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
				role="document"
				:class="`modal-${size}`"
			>
				<div class="modal-content">
					<div class="modal-header">
						<input id="modal_focus" type="hidden" />
						<h4 v-if="!hasHeaderSlot()" class="mb-0">{{ title }}</h4>
						<div v-else>
							<slot name="header"></slot>
						</div>

						<button
						    v-if="!hideCrossBtn"
							@click="handleClose()"
							type="button"
							class="close"
							data-dismiss="modal"
							aria-label="Close"
						>
							<span>
								<img src="@/assets/img/close.svg" alt="">
							</span>
						</button>
					</div>
					<div :class="noPadding ? '' : 'modal-body'">
						<slot name="body"></slot>
					</div>
					<div class="modal-footer">
						<slot name="footer-before-btn"></slot>
						<small
							v-if="hasFooterSlot() && requiredFieldsText"
							class="text-muted mr-auto"
							><span class="text-danger">*</span> Required Fields</small
						>
						<button
							v-if="!!hideCloseBtn ? !hideCloseBtn : true"
							@click="handleClose"
							type="reset"
							class="btn closeBtnStyle"
							data-dismiss="modal"
						>
							Close
						</button>
						<slot name="footer"></slot>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: ["size", "title", "requiredFieldsText", "noPadding", "hideCloseBtn", "hideCrossBtn", "closeIcon"],
	methods: {
		handleClose() {
			if (this.hasFooterSlot()) {
				if (this.$router.history.current.query.scope == "view") {
					this.$router.go(-1);
				} else {
					this.$_confirmMessage({
						size: "md",
						msg: "Are you sure you want to close? Unsaved data will be lost.",
					}).then((value) => {
						if (value) {
							this.$emit('call-close-btn')
							this.$router.go(-1);
							this.$bvToast.hide("validation_toast");
						}
					});
				}
			} else {
				this.$router.go(-1);
			}
		},
		hasFooterSlot() {
			return !!this.$slots.footer;
		},
		hasHeaderSlot() {
			return !!this.$slots.header;
		},
	},
};
</script>

<style lang="scss" scoped>
.modal-route {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	width: 100vw;
	background-color: rgba(21, 23, 35, 0.8);
	display: block;
	align-items: center;
	justify-content: center;
	z-index: 9;
}

.modal {
	/* .modal-body {
		padding-bottom: 80px;
	} */
	.modal-content {
		border-radius: 6px !important;
	}

	.modal-body ::v-deep{
		background-color: var(--body-bg);
		.card{
			background-color: var(--white) !important;
			border-radius: 6px !important;
			border: var(--card-body-border);

			.form-group{
				position: relative;
			}
			input, .vs__selected,textarea{
				font-size: 12px;
				font-weight: 500;
				color: var(--inputs-color);
			}
			.card-header, header{
				background-color: var(--sub-header-color);
				padding: 0.75rem 1.25rem !important;
				color: var(--sub-header-text) !important;
				font-size: 14px;
				font-weight: 600;
				border-top-left-radius: 6px;
				border-top-right-radius: 6px;		
			}

			.card-body{
				box-shadow: var(--box-shadow) !important;
				border-radius: 0;
				border-bottom-left-radius: 6px;
				border-bottom-right-radius: 6px;	

				#input-group-AMOUNT__BV_label_{
					text-align: left !important;
				}
				.b-table-sticky-header{
					margin: 0 !important;
    				border-radius: 6px;
					overflow-x: auto !important;
				}
				table{
					th{
						color: var(--black);
						font-size: 12px;
						font-weight: 600;
						height: 40px;
						vertical-align: middle;

						background-color: var(--alt-table-header);
						&:first-child{
							border-top-left-radius: 6px;
						}

						&:last-child{
							border-top-right-radius: 6px;
						}
					}

					tbody{
						tr{
							&:nth-of-type(even) {
								background: var(--main-grid-even-row-color) !important;
							}

							&:nth-of-type(odd) {
								background: #FFF !important;
							}

							&:last-child{
								border-bottom: none !important;
							}
						}
						td{
							height: 40px;
							vertical-align: middle;
							color: var(--black);
							font-size: 12px;
    						font-weight: 500;
						}
					}
				}
			}
		}
	}
	.modal-footer {
		border: 0;
		background-color: var(--body-bg) !important;
	}
	.modal-header {
		border-bottom: none !important;
		background-color: var(--header-color) !important;
		h4 {
		   text-transform: capitalize;
		   font-size: 14px;
		   font-style: normal;
		   font-weight: 600;
		   color: #FFF;
	   }
	}
	.close {
		color: var(--white);
		opacity: 0.6;
	}
	button.close:focus {
		opacity: 1;
		outline: none !important;
	}
	.modal-xxl {
		max-width: 97%;
		.modal-body {
			// padding: 0;
		}
	}
}

.closeBtnStyle{
	background-color: var(--modal-close);
    color: var(--header-color);
    font-size: 12px;
    font-weight: 600;
	height: 32px;
	padding: 0 1.25rem !important;
}
</style>