import getFieldTypeBindings from "@/modules/FormComponents/AddUpdateFormElementMapping.js";
const FIELD_TYPE_BINDINGS = getFieldTypeBindings({ type: "form" });
export default {
	textfield: function () {
		return {
			type: "text",
		};
	},
	checkbox: function () {
		return {
			type: "text",
		};
	},
	radio: function () {
		return { type: "text" };
	},
	switch: function () {
		return {
			type: "text",
		};
	},
	textarea: function () {
		return {
			type: "text",
		};
	},
	int: function () {
		return {
			type: "text",
		};
	},
	float: function () {
		return {
			type: "text",
		};
	},
	alphanumeric: function () {
		return {
			type: "text",
		};
	},
	hyperlink: function () {
		return {
			type: "text",
		};
	},
	html: function () {
		return {
			type: "text",
		};
	},
	email_address: function () {
		return { type: "text" };
	},
	date: function () {
		return { type: "daterange" };
	},
	time: function () {
		return { type: "time" };
	},
	datetime: function () {
		return { type: "daterange" };
	},
	select: async function () {
		const [field, { id, moduleName, collection }] = arguments;
		const bindings = {
			...await FIELD_TYPE_BINDINGS[field.fieldtype](field, { moduleName, collection, id }),
			multiple: field.multiple == 0 ? false : true,
			disabled: false,
			required: false,
		};

		delete bindings.handlers;
		delete bindings.description;
		return bindings;
	},
};
