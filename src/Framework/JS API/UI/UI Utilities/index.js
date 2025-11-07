import { REFRESH_EVENT_NAME } from "@/Framework/constants/ui.js";

import { getDependency } from '../../../utility/DEPENDENCIES_INHERITANCE/getDependency';

export { open_modal } from "./open_modal.js";
export {
	showSpinner,
	updateSpinnerMessage,
	hideSpinner,
	hideSpinnerAfter
} from "./spinner.js";

export function toast({
    title = " ",
    variant = "success",
    message,
    solid = true,
    autoHideDelay = 3000,
}) {
    const applicationInstance = getDependency('applicationInstance');
    const messageVNode = applicationInstance.$createElement("div", { domProps: { innerHTML: message } });
    return applicationInstance.$bvToast.toast([messageVNode], {
        title,
        variant,
        solid,
        autoHideDelay,
    });
}

export function alert({
    message,
    size = "sm",
    buttonSize = "sm",
    okVariant = "success",
    centered = true,
    noCloseOnBackdrop = true,
    title = undefined,
}) {
    const applicationInstance = getDependency('applicationInstance');
    const messageVNode = applicationInstance.$createElement("div", {
        class: ["confirm-box"],
        domProps: { innerHTML: message || `<b> </b>` },
    });
    return applicationInstance.$bvModal.msgBoxOk([messageVNode], {
        title: title,
        size,
        buttonSize,
        okVariant,
        centered,
        noCloseOnBackdrop,
        autoFocusButton: "ok",
    });
}

export function confirm({
    title = undefined,
    message,
    size = "sm",
    buttonSize = "sm",
    okVariant = "primary",
    okTitle = "YES",
    cancelTitle = "NO",
    footerClass = "p-2",
    hideHeaderClose = false,
}) {
    const applicationInstance = getDependency('applicationInstance');
    const messageVNode = applicationInstance.$createElement("div", {
        class: ["confirm-box"],
        domProps: { innerHTML: message || `confirm ?` },
    });
    return applicationInstance.$bvModal.msgBoxConfirm([messageVNode], {
        title: title,
        size: size,
        buttonSize,
        okVariant,
        okTitle,
        cancelTitle,
        footerClass,
        hideHeaderClose,
        centered: true,
        autoFocusButton: "ok",
    });
}

export function refresh() {
    document.dispatchEvent(new CustomEvent(REFRESH_EVENT_NAME));
}

export function showProcessProgress() {
    return window.$showProcessStatus(...arguments);
}