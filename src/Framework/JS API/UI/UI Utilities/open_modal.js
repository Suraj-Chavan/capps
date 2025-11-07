import { showCustomModal } from "@/components/Modals/customModalService.js";

const appendStyleSheet = function (styleSheet, container) {
	if (!styleSheet || !container) return;
	const style = document.createElement("style");
	style.textContent = styleSheet;
	container.appendChild(style);
	return style;
};

export async function open_modal({ title, content, size, footer, style, fields, handlers, fieldConfigurations, hideCloseButton, closeButtonLabel, backdrop, onClose } = {
    title: undefined, 
    content: "", 
    size: "sm", 
    footer: "", 
    style: "",
    fields: null,
    handlers: [],
    fieldConfigurations: {},
    hideCloseButton: false,
    closeButtonLabel: "Close",
	backdrop: true,
	onClose: null
}) {
    const { instance, context } = await showCustomModal({
        title: title,
        body: content,
        footer: footer,
        size: size,
        fields,
        fieldConfigurations,
        handlers,
        hideCloseButton,
        closeButtonLabel,
        backdrop,
        onClose
    });
    style = style || "";
    appendStyleSheet(style, instance.$el);
    return context;
}