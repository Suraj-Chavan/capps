<template>
	<span class="position-relative">
		<b-form-textarea
            :id="name"
			v-model="inputText"
			@input="onInput"
			v-bind="$attrs"
			v-on="$listeners"
			@keydown.down.prevent="navigate(1)"
			@keydown.up.prevent="navigate(-1)"
			@keydown.enter.prevent="selectSuggestion"
            @focus="showSuggestionsIfNeeded"
            @blur="hideSuggestions"
			ref="textarea"
			class="custom-scroll-textarea"
            style="white-space: pre-wrap !important;"
		></b-form-textarea>

		<b-popover
			:target="name"
			:show.sync="showSuggestions"
			placement="bottom"
			v-if="showSuggestions" 
            custom-class="suggestions"
        >
            <div ref="suggestions_box" class="scroll-y" style="height:200px;">
                <div
                    v-for="(group, category) in groupedSuggestions"
                    :key="category"
                    class="category-block"
                >
                    <div class="category-header">{{ category || "Others" }}</div>
                    <ul class="mb-0">
                        <li
                            v-for="(item, index) in group"
                            :key="item.value"
                            @mousedown.stop="selectItem(item)"
                            :class="{ slectedItem: selectedIndex === getItemIndex(category, index) }"
                        >
                            <span>{{ (item?.name || '').replace(/_/g, ' ') }}</span>
                            <span class="description" v-show="item.desc">{{ item.desc }}</span>
                        </li>
                    </ul>
                </div>
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
			filteredSuggestions: [],
			showSuggestions: false,
			selectedIndex: 0,
		};
	},
	computed: {
		inputText: {
			get() {
				return this.value;
			},
			set(value) {
				this.$emit("input", value);
			},
		},
		groupedSuggestions() {
			return this.filteredSuggestions.reduce((acc, item) => {
				if (!acc[item.category]) acc[item.category] = [];
				acc[item.category].push(item);
				return acc;
			}, {});
		},
	},
	methods: {
        showSuggestionsIfNeeded(){
            setTimeout(() => {
                this.onInput(this.inputText);
            }, 200);
        },
		onInput(value) {
			const cursorPos = this.$refs.textarea.$el.selectionStart;
			const textBeforeCursor = value.slice(0, cursorPos);

			const match = textBeforeCursor.match(/\/(\w*)$/);
			if (match) {
				const query = match[1].toLowerCase();
				this.filteredSuggestions = (this.suggestions || []).filter(
					(item) =>
						item.name.toLowerCase().includes(query.toLowerCase()) ||
						item.category.toLowerCase().includes(query)
				);
				this.showSuggestions = this.filteredSuggestions.length > 0;
				this.selectedIndex = 0;
			} else {
				this.showSuggestions = false;
			}
		},
		getItemIndex(category, index) {
			let count = 0;
			for (let cat in this.groupedSuggestions) {
				if (cat === category) break;
				count += this.groupedSuggestions[cat].length;
			}
			return count + index;
		},
		navigate(direction) {
			if (!this.showSuggestions) return;

			const totalItems = Object.values(this.groupedSuggestions).reduce(
				(sum, group) => sum + group.length,
				0
			);
			this.selectedIndex =
				(this.selectedIndex + direction + totalItems) % totalItems;

            // scroll by arrow
            this.$nextTick(() => {
                const selectedElement = document.querySelector(".slectedItem");
                if (selectedElement && this.$refs?.suggestions_box) {
                    const nextElement =
                        direction > 0
                            ? selectedElement.nextElementSibling // Move forward
                            : selectedElement.previousElementSibling; // Move backward

                    if (nextElement) nextElement.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                }
            });
        },
		selectSuggestion() {
			if (this.showSuggestions) {
				let allItems = [];
				Object.values(this.groupedSuggestions).forEach((group) =>
					allItems.push(...group)
				);
				if (allItems[this.selectedIndex]) {
					this.selectItem(allItems[this.selectedIndex]);
				}
			}
		},
        selectItem(item) {
            const textarea = this.$refs.textarea;
            const cursorPos = textarea.selectionStart; // Get cursor position
            const beforeCursor = this.inputText.slice(0, cursorPos); // Text before cursor
            const afterCursor = this.inputText.slice(cursorPos); // Text after cursor

            // Replace only the last occurrence of '/word' before the cursor
            const modifiedBeforeCursor = beforeCursor.replace(/\/\w*$/, `${item.value} `);

            // Combine modified part with the text after the cursor
            this.inputText = modifiedBeforeCursor + afterCursor;

            // Keep focus on the textarea
            this.showSuggestions = false;
            this.$nextTick(() => {
                textarea.focus();
                textarea.setSelectionRange(modifiedBeforeCursor.length, modifiedBeforeCursor.length);
            });
        },
        hideSuggestions() {
			setTimeout(() => {
				this.showSuggestions = false;
			}, 200);
		},
	},
};
</script>

<style lang="scss" scoped>
.suggestions ::v-deep{
    font-size: 12px;
	width:100% !important;
	background: var(--white);
	border: 1px solid var(--border-color);
	border-radius: 5px;
	box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
	list-style: none;
	padding: 0;
	z-index: 10;

    .popover-body{
        padding: 0 !important;
    }
}

.category-header {
	padding: 8px;
	border-bottom: 1px solid var(--border-color);
	border-top: 1px solid var(--border-color);
    color: var(--black);
}

.suggestions ul {
	padding: 0;
	list-style: none;
}

.suggestions li {
	display: flex;
	align-items: center;
	padding: 8px 8px 8px 2rem;
	cursor: pointer;
	flex-direction: column;
	align-items: flex-start;
}

.suggestions li:hover{
    background: #0136761f;
    color: var(--black) !important;
}

.suggestions li.slectedItem {
	background: var(--sub-header-color);
    color: var(--black);
}

.description{
    font-size: 10px; 
}
</style>
