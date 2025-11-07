import * as form from "../FORM";
import collection from "./Collection";
import * as uiUtilities from "./UI Utilities";

export const ui = {
	form: { ...form },
	collection,
	...uiUtilities,
};
