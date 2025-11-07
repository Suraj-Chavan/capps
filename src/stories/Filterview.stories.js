import FilterView from "@/components/FilterView"
import { action } from '@storybook/addon-actions';
import StoryRouter from 'storybook-vue-router';

export default {
    title: "FilterView",
    component: FilterView,
    argTypes:{
        filterEl: {control: 'array'},
        filterSetting: {control: 'object'},
        title: {control: 'text'}
    },
    decorators:[
        StoryRouter(
            {},
            {
                routes:[]
            }
        )
    ]
}

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    components: {FilterView},
    template: `<FilterView v-bind="$props" @download="dl"/>`,
    methods: {
        dl: action('download')
    }
})

export const Borrowings = Template.bind({});
Borrowings.args = {
    title: "Positions",
    dataset: {},
    filterEl: [
                {
                    type: "select",
                    ds: "ds-mm_product",
                    "ds-code": "symbol",
                    "ds-name": "symbol",
                    placeholder: "Select..",
                    label: "Product",
                    name: "product_type"
                },
                {
                    type: "select",
                    ds: "ds-deallisting_sort_by",
                    "ds-code": "code",
                    "ds-name": "descr",
                    placeholder: "Select..",
                    label: "Sort By",
                    name: "sort_by"
                }
            ],
    filterSetting: { card: false, grid: false, download: true }
}