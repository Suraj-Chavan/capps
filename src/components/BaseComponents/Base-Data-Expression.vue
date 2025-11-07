<template>
	<span class="position-relative">
		<b-form-textarea
			:id="name"
			class="custom-scroll-textarea"
			v-bind="$attrs"
			v-on="$listeners"
			v-model="valueProxy"
			@input="onInput"
			@keydown="onKeyDown"
			@blur="hideSuggestions"
			@focus="showSuggestionsIfNeeded"
			ref="textInput"
		></b-form-textarea>

		<b-popover
			:target="name"
			:show.sync="showSuggestions"
			placement="bottom"
			ref="popover"
		>
			<div class="base-data-expression--container scroll-y">
				<button
					v-for="(item, index) in filteredSuggestions"
					:key="index"
					class="dropdown-item d-flex justify-content-between"
					:class="{ active: index === selectedIndex }"
					@mousedown="selectSuggestion(item)"
				>
					<span v-html="highlightMatch(item)"></span>
				</button>
			</div>
		</b-popover>
	</span>
</template>

<script>
export default {
	props: {
		name: {
			type: [String, Number],
		},
		id: {
			type: [String, Number],
		},
		value: {
			type: String,
		},
		suggestions: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			showSuggestions: false,
			filteredSuggestions: [],
			selectedIndex: -1,
			cursorPosition: 0,
			currentMatch: "",
		};
	},
	computed: {
		dropdownStyle() {
			return {
				left: `${this.cursorPosition}px`,
				top: "60px",
			};
		},
		valueProxy: {
			get() {
				return this.value;
			},
			set(value) {
				this.$emit("input", value);
			},
		},
	},
	methods: {
		onInput(value) {
			const cursorPos = this.$refs.textInput.$el.selectionStart;
			this.cursorPosition = cursorPos * 8;
			const textBeforeCursor = value.slice(0, cursorPos);
			const lastOpenBracketIndex = textBeforeCursor.lastIndexOf("{");

			if (lastOpenBracketIndex !== -1) {
				this.currentMatch = textBeforeCursor.slice(lastOpenBracketIndex + 1);
				this.filteredSuggestions = this.suggestions.filter((s) =>
					s.toLowerCase().includes(this.currentMatch.toLowerCase())
				);
				this.showSuggestions = this.filteredSuggestions.length > 0;
				this.selectedIndex = 0;
			} else {
				this.showSuggestions = false;
				this.currentMatch = "";
			}
		},
		highlightMatch(item) {
			if (!this.currentMatch) return item;
			const regex = new RegExp(`(${this.currentMatch})`, "gi");
			return item.replace(regex, `<strong class="text-primary">$1</strong>`);
		},
		selectSuggestion(item) {
			const cursorPos = this.$refs.textInput.$el.selectionStart;
			const textBeforeCursor = this.valueProxy.slice(0, cursorPos);
			const lastOpenBracketIndex = textBeforeCursor.lastIndexOf("{");

			if (item && lastOpenBracketIndex !== -1) {
				this.valueProxy =
					textBeforeCursor.slice(0, lastOpenBracketIndex) +
					`{${item}} ` +
					this.valueProxy.slice(cursorPos);
			}

			this.showSuggestions = false;
			this.currentMatch = "";
		},
		hideSuggestions() {
			setTimeout(() => {
				this.showSuggestions = false;
			}, 200);
		},
		showSuggestionsIfNeeded() {
			if (this.valueProxy.includes("{")) {
				this.showSuggestions = true;
			}
		},
		onKeyDown(event) {
			if (this.showSuggestions) {
				if (event.key === "ArrowDown") {
					this.selectedIndex =
						(this.selectedIndex + 1) % this.filteredSuggestions.length;
					event.preventDefault();
				} else if (event.key === "ArrowUp") {
					this.selectedIndex =
						(this.selectedIndex - 1 + this.filteredSuggestions.length) %
						this.filteredSuggestions.length;
					event.preventDefault();
				} else if (event.key === "Enter") {
					event.preventDefault();
					this.selectSuggestion(this.filteredSuggestions[this.selectedIndex]);
				}
			}
		},
	},
};
</script>

<style scoped>
.dropdown-menu {
	z-index: 1050;
	max-height: 200px;
	overflow-y: auto;
}
.dropdown-item.active {
	background-color: #007bff;
	color: white;
}
.text-primary {
	font-weight: bold;
}
.base-data-expression--container {
	min-height: 10vh;
	max-height: 40vh;
	overflow: hidden;
	overflow-y: scroll;
}

</style>