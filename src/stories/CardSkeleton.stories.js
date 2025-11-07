import CardSkeleton from "@/components/CardSkeleton"
//import StoryRouter from 'storybook-vue-router'

export default{
    title: "CardSkeleton",
    component: CardSkeleton,
    argTypes:{
        dataSource: {control: 'number'}
    }
}

const Template = (args,{argTypes}) => ({
    props: Object.keys(argTypes),
    components: {CardSkeleton},
    template: `
        <CardSkeleton v-bind="$props"/>
    `
});

export const Default = Template.bind({});
Default.args = {
    dataSource: 9
}