<template>
	<ValidationProvider
		:class="[
			{ item: item.type != 'hidden' },
			item['class'],
			{ disabled: vdisabled() },
			{
				isRequired:
					{ ...rules, ...((customValidation.validate || {})[item['name']] || {}) }
						.required === true,
			},
			{ input_field_wrapper: true }
		]"
		:style="item['style']"
		:ref="`validation-provider-${item['name']}`"
		:vid="item['name']"
		:name="fieldNameValidator"
		:rules="{ ...rules, ...customValidation.validate[item['name']] }"
		v-slot="{ valid, errors }"
		v-if="vshow()"
	>
		<b-form-group
			:class="[`form-group-${item['type']}`, labelDirectionClass, { 'horizontal-layout': isHorizontalLayout }, { 'no-label': !fieldLabel }]"
			:id="`input-group-${item['name']}`"
			:label-for="item['name']"
			label-class="form-group-label"
			:title="showTitle ? fieldLabel : ''" 
			v-b-tooltip.hover.bottom
			:horizontal="isHorizontalLayout"
		>
			<template v-slot:label v-if="(fieldLabel || item.description) || labelDirection === 'top-bottom'">
				<slot name="control_label">
					<div class="label-container" v-if="fieldLabel || item.description || labelDirection === 'top-bottom'">
						<div class="main-label" v-if="fieldLabel || labelDirection === 'top-bottom'" :title="fieldLabel">
							{{ fieldLabel }}
							<slot :name="'label_' + item.name"></slot>
							<span v-if="nonLabelFields">&nbsp;&nbsp;&nbsp;</span>
							<span
								v-if="
									!nonLabelFields &&
									item.hide_label != true &&
									item['name'] &&
									item['type'] != 'checkbox' &&
									item['type'] != 'radio' &&
									{ ...rules, ...((customValidation.validate || {})[item['name']] || {}) }
										.required === true
								"
								class="text-danger"
								>*</span
							>
						</div>
						<div v-if="item.description" class="sub-label" :title="item.description">
							{{ item.description }}
						</div>
					</div>
				</slot>
			</template>

			<b-form-input
				autocomplete="off"
				v-if="item['type'] == 'text' || item['type'] == 'email'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
			>
			</b-form-input>

			<b-form-input
				autocomplete="off"
				v-if="item['type'] == 'number'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-amountFormat="{ allowNegative: item.allowNegative || false }"
				v-on="item.handlers || {}"
				class="text-right"
			>
			</b-form-input>

			<b-form-input
				autocomplete="off"
				v-if="item['type'] == 'numericOnly'"
				type="text"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
				v-numericOnly
			>
			</b-form-input>

			<b-form-input
				autocomplete="off"
				v-if="item['type'] == 'uppercaseOnly'"
				type="text"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
				v-uppercase
			>
			</b-form-input>

			<b-form-input
				v-if="item['type'] == 'day'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
				v-dayFormat
				autocomplete="off"
			>
			</b-form-input>
			<date-picker
				v-if="item['type'] == 'datetime' || item['type'] == 'date'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				:class="{ 'is-invalid': !!errors.length }"
				:type="item['type']"
				v-model="innerValue"
				v-on="item.handlers || {}"
				input-class="form-control"
				:format="
					item['type'] == 'datetime' ? $globalDateFormatLong : $globalDateFormatShort
				"
				:value-type="
					item['type'] == 'datetime' ? $globalDateFormatLong : $globalDateFormatShort
				"
				:disabled-date="
					item['futureDates'] == null ? function () {} : disabledDates
				"
			>
			</date-picker>

			<date-picker
				v-if="item['type'] == 'daterange'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				:class="{ 'is-invalid': !!errors.length }"
				:type="item['type']"
				v-model="innerValue"
				v-on="item.handlers || {}"
				input-class="form-control"
				:format="
					item['type'] == 'datetime' ? $globalDateFormatLong : $globalDateFormatShort
				"
				:value-type="
					item['type'] == 'datetime' ? $globalDateFormatLong : $globalDateFormatShort
				"
				:disabled-date="
					item['futureDates'] == null ? function () {} : disabledDates
				"
				range
				@input="closeDatepicker()"
				class="text-right"
				popup-class="mx-date-range-custom"
				:shortcuts="dateRangeShortcuts"
			></date-picker>

			<date-picker
				v-if="item['type'] == 'time12' || item['type'] == 'time24'"
				input-class="form-control"
				v-model="innerValue"
				v-on="item.handlers || {}"
				v-bind="item"
				type="time"
				:placeholder="placeholder_str"
			></date-picker>

			<date-picker
				v-if="item['type'] == 'time'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				:class="{ 'is-invalid': !!errors.length }"
				:type="item['type']"
				v-model="innerValue"
				v-on="item.handlers || {}"
				input-class="form-control"
				:format="$globalTimeFormat"
				:value-type="$globalTimeFormat"
				:placeholder="placeholder_str"
			>
				<template slot="icon-calendar">
					<b-icon-clock />
				</template>
			</date-picker>

			<v-select
				v-if="item['type'] == 'select'"
				append-to-body
				:calculate-position="withPopper"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
				:class="{ 'is-invalid': !!errors.length }"
				:label="item['ds-name'] || 'name'"
				:options="item['static'] == true ? item.ds : uniqueDatasetValues || []"
				:title="getTitle"
				:reduce="selectBoxReducer"
			>
			</v-select>
			
			<base-remote-select
		
				v-if="item['type'] == 'remote-select'"
				v-bind="item"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
				:class="{ 'is-invalid': !!errors.length }"
				:filterView="filterView"
				:isRemoteRead="item.isRemoteRead"
				@getSelectedValue="getSelectedValue"
				:placeholder="placeholder_str"
			>
			</base-remote-select>

			<b-form-checkbox
				v-if="item['type'] == 'checkbox'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				:value="item['checked-val'] || 'Y'"
				:unchecked-value="item['unchecked-val'] || 'N'"
				v-model="innerValue"
				v-on="item.handlers || {}"
				:switch="item['switch'] || false"
			>
				{{ item.hide_label != true ? (locale ? locale[item["name"]] : "") || item["label"] : '' }}
			</b-form-checkbox>

			<b-form-radio
				v-if="item['type'] == 'radio'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				:value="item['checked-val']"
				v-model="innerValue"
				v-on="item.handlers || {}"
				class="parent-radio"
			>
				{{ item.hide_label != true ? (locale ? locale[item["name"]] : "") || item["label"] : '' }}
			</b-form-radio>

			<b-form-checkbox-group
				v-if="item['type'] == 'checkbox-group'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
			>
				<b-form-checkbox
					:value="li.value || li"
					v-for="(li, index) in dataset"
					:key="`${item['name']}_${index}`"
				>
					{{ li.text || li }}
				</b-form-checkbox>
			</b-form-checkbox-group>

			<b-form-radio-group
				v-if="item['type'] == 'radio_options'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
			>
				<b-form-radio
					:value="li"
					v-for="(li, index) in (item_attr.enum || dataset)"
					:key="`${item['name']}_${index}`"
				>
					{{ li }}
				</b-form-radio>
			</b-form-radio-group>

			<b-form-textarea
				class="custom-scroll-textarea"
				v-if="item['type'] == 'textarea'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
				:rows="item.rows"
				:max-rows="item['max-rows']"
			>
				<slot />
			</b-form-textarea>

			<base-data-expression
				v-if="item['type'] == 'data-expression'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
				:rows="item.rows"
				:max-rows="item['max-rows']"
				:suggestions="item.suggestions"
			>
			</base-data-expression>
			
			<command-palette
				v-if="item['type'] == 'command-palette'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
				:rows="item.rows"
				:max-rows="item['max-rows']"
				:suggestions="item.commands"
			>
			</command-palette>
			
			<div v-if="item['type'] == 'filefield'">
				<!-- Display info about the currently set file (pre-populated or user-selected) -->
				<div v-if="innerValue instanceof File && innerValue.name" class="mb-1 current-file-info small">
					<b-icon icon="paperclip" aria-hidden="true"></b-icon>
					Current file: <strong class="cursor-pointer" @click="downloadUploadedFile(innerValue)">{{ innerValue.name }}</strong>
					<span v-if="innerValue.size"> ({{ formatFileSize(innerValue.size) }})</span>
					<b-button
						v-if="!vdisabled() && !(item.readonly || item_attr.readonly)"
						variant="link"
						size="sm"
						@click="clearFileFieldValue"
						class="p-0 ml-1 text-danger"
						title="Clear selection"
						v-b-tooltip.hover
					>
						<b-icon icon="x-circle-fill" aria-label="Clear file"></b-icon>
					</b-button>
				</div>
				
				<b-form-file
					:id="item_attr.id" 
					v-bind="item_attr"
					:placeholder="placeholder_str" 
					:state="errors[0] ? false : valid ? true : null"
					v-model="innerValue"
					v-on="inputFileHandlers"
					:key="fileInputKey" 
					:ref="`el_${item.name}`"
				></b-form-file>
				<!-- Note: b-form-file's v-model directly updates innerValue. -->
				<!-- If user selects a file, b-form-file updates innerValue and shows the name. -->
				<!-- If innerValue is set to null, b-form-file clears its display. -->
			</div>

			<!-- <b-form-tags 
				v-if="item['type'] == 'tags'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers||{}"
			>
			</b-form-tags> -->

			<b-form-tags
				no-outer-focus
				v-if="item['type'] == 'tags'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
			>
				<template
					v-slot="{ tags, inputAttrs, inputHandlers, tagVariant, addTag, removeTag }"
				>
					<b-input-group class="mb-2">
						<b-form-input v-bind="inputAttrs" v-on="inputHandlers"></b-form-input>
						<b-input-group-append>
							<b-button @click="addTag()" variant="primary">Add</b-button>
						</b-input-group-append>
					</b-input-group>
					<div class="tags-list" v-if="tags.length">
						<b-form-tag
							v-for="tag in tags"
							@remove="removeTag(tag)"
							:key="tag"
							:title="tag"
							:variant="tagVariant"
							class="mr-1"
							>{{ tag }}</b-form-tag
						>
					</div>
				</template>
			</b-form-tags>


			<b-button
				v-if="item['type'] == 'button'"
                variant="secondary"
                size="md"
				v-on="item.handlers || {}"
				v-bind="item_attr"
            >
                {{  
					(
						locale && 
						locale.hasOwnProperty(item["name"]) ? 
							locale[item["name"]] : 
							(item["label"] || item["name"].replace(/_/g, " "))
					) || item["label"]
				}}
            </b-button>

			<div 
				v-if="item['type'] == 'html'"
				class="html_content" 
			>
				<custom-html-component
					v-bind="item_attr"
					:html="innerValue"
				></custom-html-component>
			</div>

			<b-form-input
				autocomplete="off"
				v-if="item['type'] == 'password'"
				type="password"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
			>
			</b-form-input>

			<star-rating 
				v-if="item['type'] == 'ratings'"
				v-bind="item_attr"
				v-on="item.handlers || {}"
				v-model="innerValue"
			>
			</star-rating>

			<!--
				<b-form-rating
					autocomplete="off"
					v-if="item['type'] == 'ratings'"
					v-bind="item_attr"
					:state="errors[0] ? false : valid ? true : null"
					v-model="innerValue"
					v-on="item.handlers || {}"
				>
				</b-form-rating>
				-->

			<rich-text-editor
				v-if="item['type'] == 'rich_text_editor'"
				v-bind="item_attr"
				:state="errors[0] ? false : valid ? true : null"
				v-model="innerValue"
				v-on="item.handlers || {}"
			/>

			<b-link 
				v-if="item['type'] == 'hyperlink'"
				v-on="item.handlers || {}"
				v-bind="item_attr"
			>
				{{  
					item["label"] || (
						locale && 
						locale.hasOwnProperty(item["name"]) ? 
							locale[item["name"]] : 
							(item["label"] || item["name"].replace(/_/g, " "))
					)
				}}
			</b-link>

			<div
				class="character-count"
				v-if="
					!errors[0] &&
					maxCharacters &&
					(item['type'] == 'text' ||
						item['type'] == 'textarea' ||
						item['type'] == 'email')
				"
			>
				{{ maxCharacters }} characters left
			</div>

			<b-form-invalid-feedback>{{ errors[0] }}</b-form-invalid-feedback>
			<label
				v-if="!!item.secondaryLabel"
				class="text-capitalize form-group-label text-muted"
			>
				{{ item.secondaryLabel }}
			</label>
		</b-form-group>
	</ValidationProvider>
</template>


<script>
import { ValidationProvider } from "vee-validate";
import { createPopper } from "@popperjs/core";
import moment from 'moment';
import { globalDateFormatLong, globalDateFormatShort, globalTimeFormat } from "config";

export default {
	components: {
		ValidationProvider,
		BaseDataExpression: () => import("./BaseComponents/Base-Data-Expression.vue"),
		CommandPalette: () => import("./BaseComponents/Command-Palette.vue"),
		RichTextEditor: () => import("./BaseComponents/RichTextEditor/RichTextEditor.vue"),
		StarRating: () => import("vue-star-rating"),
		CustomHtmlComponent: () => import("../modules/FormComponents/CustomHtmlComponent.vue"),
	},
	props: {
		showTitle: {
			type: Boolean,
			default: false,
		},
		item: {
			type: [Object, String],
			default: "",
		},
		// must be included in props
		value: {
			type: null,
		},
		locale: {
			type: null,
		},
		dataset: {
			type: [Array, String],
			default: "",
		},
		customValidation: {
			type: Object,
			default: function () {
				return {
					hide: {},
					disabled: {},
					validate: {},
				};
			},
		},
		filterView: {
			type: Boolean,
			default: false,
		},
		isDatalist: {
			type: Boolean,
			default: false,
		},
		refsModel: {
			type: String,
		},
		clearable: {
			type: Boolean,
			default: true
		},
		labelDirection: {
			type: String,
			default: 'top-bottom'
		},
	},

	data() {
		const val = this.item.type == "checkbox-group" ? [] : this.value || undefined;
		return {
			innerValue: val,
			getTitle: "",
			uniqueDatasetValues: [],
			fileInputKey: 0, // For re-rendering b-form-file if necessary
			fileName: "file changed programmatically",
			dateRangeShortcuts: [
				{
					text: 'Today',
					onClick: () => {
						return [moment().toDate(), moment().toDate()];
					}
				},
				{
					text: 'Yesterday',
					onClick: () => {
						return [moment().subtract(1, 'days').toDate(), moment().subtract(1, 'days').toDate()];
					}
				},
				{
					text: 'Last 7 Days',
					onClick: () => {
						return [moment().subtract(6, 'days').toDate(), moment().toDate()];
					}
				},
				{
					text: 'Last 30 Days',
					onClick: () => {
						return [moment().subtract(29, 'days').toDate(), moment().toDate()];
					}
				},
				{
					text: 'This Month',
					onClick: () => {
						return [moment().startOf('month').toDate(), moment().endOf('month').toDate()];
					}
				},
				{
					text: 'Last Month',
					onClick: () => {
						return [moment().subtract(1, 'month').startOf('month').toDate(), moment().subtract(1, 'month').endOf('month').toDate()];
					}
				},
				{
					text: 'This Quarter',
					onClick: () => {
						return [moment().startOf('quarter').toDate(), moment().endOf('quarter').toDate()];
					}
				},
				{
					text: 'This Year',
					onClick: () => {
						return [moment().startOf('year').toDate(), moment().endOf('year').toDate()];
					}
				}
			],
			inputFileHandlers: {}
		};
	},
	computed: {
		isInputFileHandlers() {
			return {
				yes: this.item.type === "filefield",
				handlers: this.item.handlers
			};
		},
		File() { // Expose the global File constructor to the template
			return File;
		},
		fieldLabel() {
			const item = this.item;
			return (
				!this.nonLabelFields &&
				item.hide_label != true &&
				item.type != "hidden" &&
				item["type"] != "checkbox" &&
				item["type"] != "radio"
			) ? (
					this.locale && 
					this.locale.hasOwnProperty(item["name"]) ? 
						this.locale[item["name"]] : 
						(item["label"] || item["name"].replace(/_/g, " "))
				) || item["label"] : null
		},
		$globalDateFormatLong() {
			return globalDateFormatLong
		},
		$globalDateFormatShort() {
			return globalDateFormatShort;
		},
		$globalTimeFormat() {
			return globalTimeFormat;
		},
		nonLabelFields() {
			return ['button', 'hyperlink'].includes(this.item.type);
		},
		fieldNameValidator() {
			const locale = this.locale || {};
			const item = this.item;
			let nameLabel = locale[item['name']] || item['name'].replace(/_/g, " ");
			return item['label'] || nameLabel;
		},
		maxCharacters() {
			if (
				this.innerValue &&
				this.item.rules &&
				this.item.rules.max &&
				this.item.rules.max[0] >= this.innerValue.length
			) {
				return this.item.rules.max[0] - this.innerValue.length;
			} else {
				return "";
			}
			// `${innerValue && item.rules && item.rules.max &&  item.rules.max[0] >= innerValue.length ? item.rules.max[0] -  innerValue.length : 0} Character Left`
		},
		item_attr() {
			if(this.item.type === "ratings") {
				const _item = { ...this.item };
				delete _item.type;
				delete _item.handlers;
				return {
					inline: _item.inline,
					starSize: _item.size,
					maxRating: _item.stars,
					increment: _item.increment,
					showRating: _item.showValue,
					clearable: _item.clearable,
					readOnly: _item.readonly == 1 || _item.disabled == 1,
					padding: _item.padding,
					disabled: this.vdisabled(),
					ref: `el_${this.item["name"]}`,
				}
			}
			return {
				name: this.item["name"],
				id: this.item["name"], // Added for b-form-file to match label's 'for'
				// id:this.item['name'],
				placeholder: this.placeholder_str,
				ref: `el_${this.item["name"]}`,
				stacked: this.item["stacked"],
				multiple: this.item["multiple"],
				taggable: this.item["taggable"],
				tabindex: this.item["tabindex"],
				maxlength: this.item["maxlength"],
				accept: this.item.accept,
				disabled: this.vdisabled(),
				clearable: this.clearable,
				readonly: this.item.readonly || false, // Pass readonly to b-form-file if applicable

				...(this.item.type === "hyperlink" && {
					href: this.item.href,
					target: this.item.target,
					rel: this.item.rel,
				}),

				...(
					this.item.type === "radio_options" && {
						enum: this.item.enum,
					}
				),

				...(
					this.item.type === "html" && {
						reference: this.item.reference,
						collection: this.item.collection,
						moduleName: this.item.moduleName,
						id: this.item.id,
					}
				)
			};
		},
		placeholder_str() {
			// Hide placeholder text for disabled fields by default
			if (this.vdisabled()) {
				return "";
			}

			const item = this.item;
			let placeholder_str = (
				this.locale && 
				this.locale.hasOwnProperty(item["name"]) ? 
					this.locale[item["name"]] : 
					(item["label"] || item["name"].replace(/_/g, " "))
			) || item["label"];

			let str =
				item.type == "filefield" || 
				item.type == "select" ||
				item.type == "remote-select" ||
				item.type == "date" ||
				item.type == "datetime" ||
				item.type == "time12" ||
				item.type == "time24" ||
				item.type == "time"
					? `SELECT ${placeholder_str}`
					: `ENTER ${placeholder_str}`;

			return str.toUpperCase();
		},
		rules() {
			if (this.item["type"] == "number") {
				return { numeric_comma: true, ...this.item["rules"] };
			} else if (this.item["type"] == "numericOnly") {
				return { double: true, ...this.item["rules"] };
			} else {
				return { ...this.item["rules"] };
			}
		},
		labelDirectionClass() {
			return `label-direction-${this.labelDirection}`;
		},
		isHorizontalLayout() {
			return ['left-right', 'right-left'].includes(this.labelDirection);
		}
	},
	watch: {
		isInputFileHandlers: {
			immediate: true,
			handler(newValue) {
				if(newValue.yes) {
					this.inputFileHandlers = { 
						...this.inputFileHandlers, 
						...this.getHandlers(newValue.handlers) 
					};
				}
			}
		},
		innerValue(newVal) {
			this.$emit("input", newVal);
		},
		value(newVal) {
			this.innerValue = newVal;
		},
	},
	created() {
		if (this.value) {
			this.innerValue = this.value;
		}
		if (this.item.value) {
			this.innerValue = this.item.value;
		}
	},
	methods: {
		getHandlers(passedItemHandlers) { // Renamed for clarity, this is `this.item.handlers`
			const originalInputHandler = passedItemHandlers && typeof passedItemHandlers.input === 'function' 
									 ? passedItemHandlers.input 
									 : null;

			return  {
				// Spread all original handlers. If passedItemHandlers is null/undefined,
				// (passedItemHandlers || {}) ensures we spread an empty object, not causing an error.
				...(passedItemHandlers || {}), 
				
				// Override or add the 'input' handler
				input: (...args) => { 
					const file = args?.[0]; // The first argument from the input event (File object or null)
					
					// Update this.fileName based on the file selected/cleared
					if (file instanceof File) {
						this.fileName = file.name;
					} else {
						this.fileName = null; // Handles clearing or non-File event args
					}

					// Call the original input handler if it was provided in this.item.handlers
					if (originalInputHandler) {
						return originalInputHandler.apply(this, args);
					}
				}
			};
		},
		downloadUploadedFile(file) {
			var blob = new Blob([file]);
			var url = window.URL.createObjectURL(blob);
			var a = document.createElement("a");
			a.href = url;
			a.download = file.name;
			a.click();
		},
		selectBoxReducer(a) {
			return this.item.reducer(a) || ((a) => (a[item['ds-code']] ? a[item['ds-code']].toString() : a['code']))(a);
		},		
		withPopper(dropdownList, component, { width }) {

			dropdownList.style.width = width


			const popper = createPopper(component.$refs.toggle, dropdownList, {
				placement: "bottom",
				modifiers: [
					{
						name: 'offset',
						options: {
							offset: [0, 0],
						},
					},

				],
			})


			return () => popper.destroy()
		},
		vshow() {
			const HIDE_FIELD_CONFIGURATION = this.customValidation?.hide || {};
			if((this.$hasOwn(HIDE_FIELD_CONFIGURATION, this.item.name))) {
				// false check and then negation added to avoid non boolean values.
				return !(HIDE_FIELD_CONFIGURATION[this.item.name] === false);
			}

			return true;
		},
		vdisabled() {
			let isDisabled =
				((this.customValidation || {}).disabled || {})[this.item.name] ||
				this.item["disabled"];
			return this.$isUndef(isDisabled) ? false : isDisabled;
		},
		disabledDates(date) {
			if(this.item["disabledDate"] != null) return this.item["disabledDate"](date);
			return this.item["futureDates"] == true
				? this.futureDatesEnable(date)
				: this.futureDatesDisable(date);
		},
		futureDatesDisable(date) {
			const givenDate = moment(date).startOf('day');
			const currentDate = moment().startOf('day');
			return givenDate.isAfter(currentDate);
		},
		futureDatesEnable(date) { 
			const givenDate = moment(date).startOf('day');
			const currentDate = moment().startOf('day');
			return givenDate.isBefore(currentDate);
		},
		getSelectedValue(val) {
			this.$emit("getSelectedValue", {
				refsModel: this.refsModel,
				nameRef: this.item.nameRef,
				val: val,
				code: this.innerValue
			});
		},
		closeDatepicker() {
			this.$refs[this.item_attr.ref].closePopup();
		},
		formatSelectValue(newVal, arr) {
			this.innerValue = newVal.toString();
			const _filterd = arr.filter((i) => {
				if (i[this.item["ds-code"]] == newVal) {
					return i[this.item["ds-code"]] == newVal;
				}
			});

			if (_filterd && _filterd[0]) {
				this.getTitle = _filterd ? _filterd[0][this.item["ds-name"]] : [];
				this.getSelectedValue(this.getTitle);
			}
		},
		clearFileFieldValue() {
			// Access the b-form-file component instance using the ref defined in item_attr
			const fileInputComponent = this.$refs[`el_${this.item["name"]}`];

			if (fileInputComponent && typeof fileInputComponent.reset === 'function') {
				// Attempt to call the component's reset method.
				// This might handle some internal UI clearing for b-form-file.
				fileInputComponent.reset();

				// Manually trigger the 'input' handler if it exists in item.handlers.
				// This is done because the problem states reset() is not triggering the emit event.
				// We assume 'input' is the primary event handler concerned with value changes.
				
				if (this.fileName === "file changed programmatically" && this.item.handlers && typeof this.item.handlers.input === 'function') {
					fileInputComponent.$emit('input', null);
				}

				// Note: If b-form-file's reset() also failed to visually clear its state
				// despite v-model (innerValue) now being null, then uncommenting the next line
				// might be necessary as a last resort to force a UI refresh of b-form-file.
				// However, b-form-file should ideally react to its v-model becoming null.
				// this.fileInputKey++;
			} else {
				// Fallback if the reset method is not found on the component instance.
				console.warn(`File input component or its reset method not found for '${this.item.name}'. Falling back to manual clear.`);
				this.innerValue = null;
				this.fileInputKey++; // Force re-render of b-form-file to ensure its visual state is reset.

				// Manually trigger the 'input' handler in the fallback case as well.
				if (this.item.handlers && typeof this.item.handlers.input === 'function') {
					this.item.handlers.input(null);
				}
			}
		},
		formatFileSize(bytes, decimals = 2) {
			if (!bytes || bytes === 0) return '0 Bytes';
			const k = 1024;
			const dm = decimals < 0 ? 0 : decimals;        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
			const i = Math.floor(Math.log(bytes) / Math.log(k));
			return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
		}
	},
};
</script>


<style scope>
	.input_field_wrapper {
		position: relative;
	}
	.parent-radio .custom-control-input {
	display: none !important;
}
/* Hide the before and after pseudo-elements for the label */
.parent-radio .custom-control-label::before,
.parent-radio .custom-control-label::after {
	content: none !important;
}

.parent-check{
	display: flex !important;
	align-items: center !important;
}

.invalid-feedback{
	width: max-content !important;
}

.html_content{
	box-sizing: border-box;
}

.current-file-info {
	word-break: break-all;
}

/* Label Direction CSS Classes */
.label-direction-top-bottom {
	/* Default behavior - no additional styling needed */
}

.label-direction-bottom-top {
	display: flex;
	flex-direction: column-reverse;
}

.label-direction-left-right {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	gap: 12px;
}

.label-direction-left-right label {
	margin-bottom: 0;
	flex: 1;
	max-width: 50%;
}

.label-direction-right-left {
	display: flex;
	flex-direction: row-reverse;
	align-items: flex-start;
	gap: 12px;
}

.label-direction-right-left label {
	margin-bottom: 0;
	flex: 1;
	max-width: 50%;
}

.label-direction-left-right .form-control,
.label-direction-right-left .form-control,
.label-direction-left-right .v-select,
.label-direction-right-left .v-select,
.label-direction-left-right .mx-datepicker,
.label-direction-right-left .mx-datepicker,
.label-direction-left-right textarea,
.label-direction-right-left textarea {
	flex: 1;
	width: 100%;
}

/* Ensure the input wrapper div also expands to 50% */
.label-direction-left-right > div:not(.form-group-label),
.label-direction-right-left > div:not(.form-group-label) {
	flex: 1;
	max-width: 50%;
	width: 100%;
}

/* Handle fields without labels - use full width instead of 50/50 columns */
.label-direction-left-right.no-label,
.label-direction-right-left.no-label {
	display: block;
}

.label-direction-left-right.no-label .form-control,
.label-direction-right-left.no-label .form-control,
.label-direction-left-right.no-label .v-select,
.label-direction-right-left.no-label .v-select,
.label-direction-left-right.no-label .mx-datepicker,
.label-direction-right-left.no-label .mx-datepicker,
.label-direction-left-right.no-label textarea,
.label-direction-right-left.no-label textarea {
	width: 100%;
	max-width: none;
}

.label-direction-left-right.no-label > div:not(.form-group-label),
.label-direction-right-left.no-label > div:not(.form-group-label) {
	max-width: none;
	width: 100%;
}

/* Special handling for HTML fields in horizontal layout without labels */
.label-direction-left-right.no-label .html_content,
.label-direction-right-left.no-label .html_content {
	width: 100%;
	max-width: none;
}

/* Checkbox and radio fields without labels should use full width */
.label-direction-left-right.no-label .parent-check,
.label-direction-right-left.no-label .parent-check {
	width: 100%;
	max-width: none;
	justify-content: flex-start;
}

/* Sub-label styling */
.label-container {
	display: flex;
	flex-direction: column;
}

.main-label {
	font-weight: inherit;
}

.sub-label {
	font-size: 0.9em;
	font-weight: normal;
	margin-top: 2px;
	line-height: 1.2;
	color: #6c757d;
	word-break: break-word;
	overflow-wrap: break-word;
}

/* Sub-label styling for horizontal layouts */
.label-direction-left-right .label-container,
.label-direction-right-left .label-container {
	flex: 1;
	max-width: 50%;
}

/* Responsive behavior for sub-labels */
@media (max-width: 768px) {
	.label-direction-left-right .sub-label,
	.label-direction-right-left .sub-label {
		margin-top: 4px;
		margin-bottom: 0.5rem;
	}
}

/* Special handling for checkbox, radio, switch - ONLY when they have a top label */
.label-direction-left-right .form-group-checkbox:not(.no-label),
.label-direction-left-right .form-group-radio:not(.no-label),
.label-direction-left-right .form-group-switch:not(.no-label),
.label-direction-right-left .form-group-checkbox:not(.no-label),
.label-direction-right-left .form-group-radio:not(.no-label),
.label-direction-right-left .form-group-switch:not(.no-label) {
	justify-content: flex-end;
}

.label-direction-left-right .form-group-checkbox:not(.no-label) > div:not(.form-group-label),
.label-direction-left-right .form-group-radio:not(.no-label) > div:not(.form-group-label),
.label-direction-left-right .form-group-switch:not(.no-label) > div:not(.form-group-label),
.label-direction-right-left .form-group-checkbox:not(.no-label) > div:not(.form-group-label),
.label-direction-right-left .form-group-radio:not(.no-label) > div:not(.form-group-label),
.label-direction-right-left .form-group-switch:not(.no-label) > div:not(.form-group-label) {
	max-width: 50%;
	width: 50%;
}

/* Fields with no labels should use full width in horizontal layouts */
.label-direction-left-right .form-group-ratings.no-label,
.label-direction-right-left .form-group-ratings.no-label,
.label-direction-left-right .form-group-button.no-label,
.label-direction-right-left .form-group-button.no-label,
.label-direction-left-right .form-group-hyperlink.no-label,
.label-direction-right-left .form-group-hyperlink.no-label {
	display: block;
}

.label-direction-left-right .form-group-ratings.no-label .vue-star-rating,
.label-direction-right-left .form-group-ratings.no-label .vue-star-rating {
	width: 100%;
}

/* When no label is present, the field should expand into the label space */
.horizontal-layout.no-label {
	justify-content: stretch !important;
}

.horizontal-layout.no-label > *:not(.form-group-label) {
	flex: 1 !important;
	max-width: 100% !important;
}

/* Responsive behavior for horizontal layouts */
@media (max-width: 768px) {
	.label-direction-left-right .form-group,
	.label-direction-right-left .form-group {
		flex-direction: column;
		align-items: flex-start;
	}
	
	.label-direction-left-right .form-group label,
	.label-direction-right-left .form-group label {
		margin-bottom: 0.5rem;
		min-width: auto;
	}
}

</style>