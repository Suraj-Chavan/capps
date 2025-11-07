import NoData from "@/components/NoData.vue"

export default {
    title: "NoData",
    component: NoData
}

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    components: {NoData},
    template: `<NoData />`
});


export const Default = Template.bind({});