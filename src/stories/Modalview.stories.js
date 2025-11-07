import ModalView from "@/components/ModalView"
import StoryRouter from 'storybook-vue-router'

export default {
    title: "ModalView",
    component: ModalView,
    argTypes:{
        size: {control: {type: 'select', options: ['sm','lg']}},
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
    components:{ModalView},
    template:`
        <ModalView v-bind="$props"/>
    `
})

export const small = Template.bind({});
small.args = {
    title: 'Sanctions',
    size: 'sm'
}

export const large = Template.bind({});
large.args = {
    title: 'Sanctions',
    size: 'lg'
}
