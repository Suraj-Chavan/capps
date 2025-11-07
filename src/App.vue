<template>
	<div id="app">
		<router-view id="index-app-router"></router-view>
		<b-toast id="validation_toast" variant="danger">
			<template v-slot:toast-title>
				<div class="d-flex flex-grow-1 align-items-baseline">
					<b-img
						blank
						blank-color="#ff5555"
						class="mr-2"
						width="10"
						height="10"
					></b-img>
					<strong class="mr-auto">Required Fields</strong>
				</div>
			</template>
			<ul class="m-0 pl-4">
				<li v-for="(item, index) in validationErrors" :key="index">{{ item }}</li>
			</ul>
		</b-toast>

		<transition name="bounce" v-if="isLoading">
			<div class="loading">
				<!-- {{refCount}} -->
				<b-icon icon="three-dots" animation="cylon" font-scale="4"></b-icon>
			</div>
		</transition>
	</div>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "app",
	created() {
		window.capps.injectDependencies("applicationInstance", this);
		console.log("%c" + process.env.VUE_APP_VERSION, "color:blue;font-size: 14px;font-weight: 700");
		let oldIcon = document.getElementById("appIcon").href.split('/');
		oldIcon[oldIcon.length -1] = config.appIcon || "credence_icon.webp";
		console.log('safln', config.appIcon)
		let newIcon = oldIcon.join('/');
		document.getElementById("appIcon").href = newIcon;
	},
	computed: {
		...mapState(["isLoading", "refCount", "validationErrors"]),
	},
};
</script>