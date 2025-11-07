// import { getDependency } from '../../utility/DEPENDENCIES_INHERITANCE/getDependency';

export default function () {
    // _this will refer to the Vue component instance where this utility is invoked.
    // This is a common pattern to capture the component's context.
    
    // const _this = getDependency('applicationInstance');

    // h is an alias for _this.$createElement. In Vue.js, this function is used to
    // programmatically create Virtual DOM nodes. It's declared here but not
    // used in the `add_html` or `remove_html` functions as they currently stand.
    // It might be intended for more complex HTML generation in the future.
    // const h = _this.$createElement;

    // DOM_MAPPINGS is an empty object. It's likely intended to store references
    // to the HTML elements that are added, possibly using `buttonId` as keys.
    // This would allow for easier management (like removal) of specific pieces of HTML.
    const DOM_MAPPINGS = {};


    return {
        get selectedRecords() {
            const _this = window.capps.getDependency('applicationInstance');
            const store = _this.$store;
            return store.state.ChoseRecord.checkedItemList;
        },
        // clear_html_container: This method clears all HTML content from the
        // htmlContainer and resets the DOM_MAPPINGS object.
        clear_html_container() {
            const htmlContainer = document.querySelector(".capps_collection-view-container #CAPPS_CUSTOM_HTML_CONTAINER");
            if (htmlContainer) { // Good practice to check if the container exists
                htmlContainer.innerHTML = "";
            }
            // Reset DOM_MAPPINGS by clearing its properties
            for (const key in DOM_MAPPINGS) {
                if (Object.hasOwnProperty.call(DOM_MAPPINGS, key)) {
                    delete DOM_MAPPINGS[key];
                }
            }
        },

        // add_html: This is the function you asked about.
        // Its purpose is to add new HTML content into the htmlContainer.
        add_html(buttonId, html) {
            const htmlContainer = document.querySelector(".capps_collection-view-container #CAPPS_CUSTOM_HTML_CONTAINER");
            // Parameters:
            // - buttonId: An identifier, likely to associate the added HTML with a
            //             specific source (e.g., a button that triggered the addition).
            //             This ID could be used later to update or remove this specific HTML.
            // - html: The HTML content (as a string or a DOM element) to be inserted.

            // Current Implementation:
            if (!htmlContainer) {
                console.error("htmlContainer not found.");
                return;
            }

            // If HTML for this buttonId already exists, remove it first
            if (DOM_MAPPINGS[buttonId]) {
                this.remove_html(buttonId);
            }

            // Create a wrapper div for the new content to easily manage it
            const wrapper = document.createElement('div');
            // Add a class or attribute for potential styling or identification
            wrapper.classList.add('capps-custom-html-item'); // Optional: Add a class for styling
            wrapper.setAttribute('data-button-id', buttonId); // Store buttonId for easier identification

            if (typeof html === 'string') {
                wrapper.innerHTML = html;
            } else if (html instanceof Node) {
                wrapper.appendChild(html);
            } else {
                console.error("Invalid HTML content type for add_html. Expected string or Node.");
                return;
            }

            htmlContainer.appendChild(wrapper);
            DOM_MAPPINGS[buttonId] = {
                container: htmlContainer,
                wrapper,
            }; // Store reference to the wrapper
        },

        // remove_html: This function is intended to remove a specific piece of HTML
        // from the htmlContainer, identified by `buttonId`.
        remove_html(buttonId) {
            const container = DOM_MAPPINGS[buttonId].container;
            const wrapper = DOM_MAPPINGS[buttonId].wrapper;
            if (DOM_MAPPINGS[buttonId] && container && wrapper) {
                container.removeChild(wrapper);
                delete DOM_MAPPINGS[buttonId];
            }
        }
    }
}
