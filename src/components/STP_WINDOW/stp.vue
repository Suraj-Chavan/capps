<template>
	<div>
		<div
			:class="miniClicked ? 'STP-modal' : 'STP-modal-minimized'"
			v-if="isStpModalOpen"
		>
			<div id="STP-modal_header">
				<div id="STP-modal_header_title">STP</div>
				<div id="STP-modal_header_right">
					<button class="icon-btn" @click="minimize">
						<i class="fas fa-minus modal-title-icon"></i>
					</button>
					<button
						type="button"
						@click="closeStpModal"
						class="close"
						aria-label="Close"
					>
						<span>
							<img src="@/assets/img/close.svg" alt="" />
						</span>
					</button>
				</div>
			</div>
			<div class="iframe-cotainer scroll-y">
				<iframe
					ref="iframe_stp"
					:src="stpUrl"
					styles="width: 100%;height: 125vh;"
					width="100%"
					height="110%"
					frameborder="0"
					allowfullscreen
				></iframe>
			</div>
			<div class="d-flex justify-content-end mt-3 close-btn">
				<button class="btn btn-secondary mr-3" @click="closeStpModal">Close</button>
			</div>

			<div :class="miniClicked ? 'displayNone' : 'maxBtn'">
				<button class="icon-btn" @click="minimize">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						class="bi bi-window"
						viewBox="0 0 16 16"
					>
						<path
							d="M2.5 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"
						/>
						<path
							d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2zm13 2v2H1V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1zM2 14a1 1 0 0 1-1-1V6h14v7a1 1 0 0 1-1 1H2z"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
    name: "stp",

    props: {
        stpUrl: {
            type: String,
            require: true
        },
        open: {
            type: Boolean,
            default: false
        },
        onCloseModal: {
            type: Function,
            require: true
        }
    },

    computed: {
        isStpModalOpen: {
            get() {
                return this.open
            },
            set(value) {
                this.$emit("modal:open", value);
            }
        }
    },

    data() {
        return {
            miniClicked: true,
        }
    },

    methods: {
        minimize() {
			this.miniClicked = !this.miniClicked;
		},
        async closeStpModal() {
			this.isStpModalOpen = false;
            this.onCloseModal();
		},
    },
}
</script>

<style lang="scss" scoped>
.iframe-cotainer {
	height: 111vh;
}
.STP-modal-minimized {
	height: 50px;
	width: 50px;
	overflow: hidden;
	border-radius: 50%;
	bottom: 20px !important;
	top: inherit;
	left: 20px !important;
	z-index: 199999999999;
	position: fixed;
	background-color: #fff;
	transition: 200ms linear;
}

.STP-modal {
	height: 100%;
	width: 100vw;
	background-color: #fff;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 199999999999;
	transition: 200ms linear;
}

#STP-modal_header {
	width: 100vw;
	background-color: var(--header-color);
	display: flex;
	align-items: center;
	padding: 12px 1rem;
	justify-content: space-between;
}

#STP-modal_header_title {
	font-size: 1.25rem;
	font-weight: 500;
	color: #fff;
}

#STP-modal_header_right {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 15px;
	button {
		background-color: transparent;
		border: none;
		color: #f8f9fa !important;
		opacity: 0.5;

		&:hover {
			opacity: 0.75;
		}
	}
}
.displayNone {
	display: none;
}
.maxBtn {
	position: absolute;
	z-index: 100000000000000000000;
	left: -32px;
	bottom: -29px;
	background: #fff;
	padding: 44px;
	transition: 200ms linear;

	& button {
		border: none;
		background: transparent;
	}
}
</style>