<template>
	<section class="record-actions">
		<b-dropdown
			id="dropdown-dropleft"
			size="sm"
			class="mr-n2"
			right
			no-caret
			variant="button"
			v-if="itsCardView"
		>
			<template v-slot:button-content>
				<b-icon-three-dots-vertical />
			</template>
			<template v-for="item in allStandardActions">
				<b-dropdown-item 
					:key="item.attrs.title"
					v-b-tooltip.hover  
					v-bind="item.attrs"
					v-on="item.handlers"
					v-if="item.if"
				>
					<component :is="item.cardComponent"></component>
				</b-dropdown-item>
			</template>
		</b-dropdown>

		<b-button-toolbar v-else>
			<b-button-group class="">
				<template v-for="item in allStandardActions">
					<b-button 
						v-b-tooltip.hover 
						:key="item.attrs.title"
						v-bind="item.attrs"
						v-on="item.handlers"
						v-if="item.if"
					>
						<component :is="item.component"></component>
					</b-button>
				</template>
			</b-button-group>
		</b-button-toolbar>
	</section>
</template>
<script>
import { ActionMixin } from "@/mixins/action-mixin";
import Clipboard from "../../../components/IconComponents/Clipboard.vue";

export default {
	mixins: [ActionMixin],
	props: [
		"item",
		"routePath",
		"collection",
		"referenceKey",
		"localeEl",
		"showIcons",
		"showDots",
		"filterSetting",
		"moduleName",
		"isAction",
		"itsCardView",
	],
	computed: {
		actionVisibilityCase() {
			return this.filterSetting || {};
		},
		allStandardActions() {
			const item = this.item;
			return [
				{
					if: true,
					component: { template: `<b-icon-eye aria-hidden="true" />`},
					cardComponent: { template: `<span>&nbsp;<b-icon-eye aria-hidden="true" scale="1.3"/>&nbsp; ${this.localeEl.actions.VIEW || 'View'}</span>`},
					attrs: {
						variant: "none",
						size: "md",
						title: this.localeEl.actions.VIEW || 'View',
					},
					handlers: {
						click: this.openViewScreen,
					},
				},
				{
					if: this.actionVisibilityCase.modify,
					component: { template: `<b-icon-pen aria-hidden="true" />`},
					cardComponent: { template: `<span>&nbsp;<b-icon-pen aria-hidden="true" scale="1.3"/>&nbsp; ${this.localeEl.actions.UPDATE || 'Modify'}</span>`},
					attrs: {
						variant: "none",
						size: "md",
						title: this.localeEl.actions.UPDATE || 'Modify',
					},
					handlers: {
						click: this.openUpdateScreen
					},
				},
				{
					if: this.actionVisibilityCase.delete,
					component: { template: `<b-icon-trash aria-hidden="true" />` },
					cardComponent: { template: `<span>&nbsp;<b-icon-trash aria-hidden="true" scale="1.3" />&nbsp; ${this.localeEl.actions.DELETE || 'Delete'}</span>`},
					attrs: {
						variant: "none",
						size: "md",
						title: this.localeEl.actions.DELETE || 'Delete',
					},
					handlers: {
						click: this.deleteAction,
					},
				},
				{
					if: this.actionVisibilityCase.add || this.actionVisibilityCase.duplicate,
					component: {template: `<b-icon-files-alt aria-hidden="true" />`},
					cardComponent: { template: `<span>&nbsp;<b-icon-files-alt aria-hidden="true" scale="1.3" />&nbsp; ${this.localeEl.actions.DUPLICATE || 'Duplicate'}</span>`},
					attrs: {
						variant: "none",
						size: "md",
						title: this.localeEl.actions.DUPLICATE || 'Duplicate',
					},
					handlers: {
						click: this.openAddScreen,
					},
				},
				{
					if: true,
					component: { template: `<Clipboard />`, components: { Clipboard, }, },
					cardComponent: { template: `<span><Clipboard /> ${this.localeEl.actions.COPY || 'Copy Record'}</span>`, components: { Clipboard, },},
					attrs: {
						variant: "none",
						size: "md",
						title: this.localeEl.actions.COPY || 'Copy Record',
					},
					handlers: {
						click: () => this.copyToClipboardTable([item], 'Record copied to clipboard.')
					},
				}
			]
		},
	},
	methods: {
		openAddScreen() {
			const _this = this;
			setTimeout(() => {
				_this.$router.push(`/${_this.moduleName}/doc/${_this.collection}/add/${_this.item.ID || ""}`);
			}, 100);
		},
		openUpdateScreen() {
			const _this = this;
			setTimeout(() => {
				_this.$router.push(`/${_this.moduleName}/doc/${_this.collection}/update/${_this.item.ID || ""}`);
			}, 100);
		},
		openViewScreen() {
			const _this = this;
			setTimeout(() => {
				_this.$router.push(`/${_this.moduleName}/doc/${_this.collection}/view_record/${_this.item.ID || ""}`);
			}, 100);
		},
		deleteAction() {
			setTimeout(() => {
				const _this = this;
				this.$_confirmMessage({
					size: "md",
					msg: "Are you sure you want to delete this record?",
				}).then((value) => {
					if (!value) return;
					(function fn() {
						let vObj = {};
						vObj["_ignore_prc_con"] = _this.ignore_prc_con;
						_this.$store.commit("loading", true);
						_this.$credCAPI
							.collection(`${_this.moduleName}/${_this.collection}/delete/${_this.item.ID || ""}`)
							.read({ body: vObj })
							.then(async (response) => {
								_this.$store.commit("loading", false);
								await _this.$responseHandler(response, fn, _this, "noRouteChange");
								_this.$emit("refresh:clicked");
							})
							.catch((error) => console.error(error));
					}.call(this));
				});
			}, 100);
		},
	}
};
</script>
