
export default ({ body, footer, hideCloseButton = false, closeButtonLabel = "Close", backdrop = true }) => {
	return {
		template: `
	<div
		v-if="isVisible"
		class="modal fade show d-block"
		tabindex="-1"
		role="dialog"
	>
		<div class="modal-backdrop fade show" style="z-index: -1;" @click.self="backdrop ? closeModal() : null"></div>
		<div
			class="modal-dialog modal-dialog-centered"
			:class="modalSizeClass"
			role="document"
		>
			<div class="modal-content">
				<!-- Modal Header -->
				<div class="modal-header" v-if="title">
					<h5 class="modal-title">{{ title }}</h5>
					<button type="button" class="close" @click="closeModal">
						<span>&times;</span>
					</button>
				</div>

				<!-- Modal Body -->
				<div class="modal-body">
                     ${body ? body : ""}
				</div>

				<!-- Modal Footer -->
				<div v-if="${!!footer} || handlers.length || (!handlers.length && !${hideCloseButton})" :class="{'modal-footer d-flex': true, 'justify-content-between': ${!!footer}}">
                    ${footer ? footer : ""}
					<button v-for="item in handlers" :key="item.label" type="button" class="btn" :class="'btn-' + (item.variant||'secondary') + ' btn-'+(item.size||'md')" @click="item.handler(thisContext)">
						{{item.label}}
					</button>
					<button v-if="!handlers.length && !${hideCloseButton}" type="button" class="btn btn-danger btn-md" @click="closeModal">
						${closeButtonLabel}
					</button>
				</div>
			</div>
		</div>
	</div>`,
		props: {
			title: String,
			size: {
				type: String,
				default: "md",
			},
			visible: {
				type: Boolean,
				default: true,
			},
			handlers: {
				type: Array,
				default: () => ([]),
			},
			backdrop: {
				type: Boolean,
				default: true,
			},
		},
		computed: {
			modalSizeClass() {
				return (
					{
						sm: "modal-sm",
						lg: "modal-lg",
						xl: "modal-xl",
						xxl: "modal-xxl",
					}[this.size] || ""
				);
			},
			isVisible: {
				get() {
					return this.visible;
				},
				set(value) {
					this.$emit("update:visible", value);
				},
			},
		}
	};
};
