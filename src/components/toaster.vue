<template lang="html">

	<section class="toaster">
		<div class="message" :class="msg.length > 0 ? 'showToast ' + type : ''"> {{ msg }}</div>
	</section>

</template>

<script lang="js">
import formUtils from '@/utils/var/formUtil'

var eventBus = formUtils.eventBus;
export default {
	name: 'toaster',
	props: [],
	mounted() {
		eventBus.$on("toaster", (data) => {
			this.type = data.type;
			this.msg = data.msg;
			var _this = this;
			setTimeout(() => {
				_this.msg = "";
			}, 5000)
		})
	},
	data() {
		return {
			msg: "",
			type: ""
		}
	},
	methods: {

	},
	computed: {

	}
}
</script>

<style scoped lang="scss">
.toaster {
	.message {
		position: fixed;
		z-index: 200;
		bottom: 25px;
		right: 20px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 15px;
		border-radius: 5px;
		transition: 0.2s all linear;
		transform: translateY(500px);

		&.showToast {
			transform: translateY(0)
		}
	}
}
</style>
