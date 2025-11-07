import Header from '@/components/Header.vue'
import StoryRouter from 'storybook-vue-router';


export default {
    title: "Header",
    component: Header,
    decorators:[
        StoryRouter(
            {},
            {
                routes:[
                    {path: "/FrontOffice", redirect:"/"},
                    {path: "/FrontOffice/Dashboard", redirect:"/"},
                    {path: "/FrontOffice/Borrowings", redirect:"/"},
                    {path: "/FrontOffice/Sanctions", redirect:"/"},
                    {path: "/FrontOffice/Creditline", redirect:"/"},
                    {path: "/FrontOffice/Transactions", redirect:"/"},
                    {path: "/login", redirect:"/"},
                    {path: "/Operations", redirect:"/"}
                ]
            }
        )
    ]
}

const Template = (args) => ({
    components: { Header },
    template: '<Header />',
})

export const Default = Template.bind({});

/*
storiesOf('Header',module)
    .addDecorator(StoryRouter(
        {},
        {
            routes:[
                {path: "/FrontOffice", redirect:"/"},
                {path: "/FrontOffice/Dashboard", redirect:"/"},
                {path: "/FrontOffice/Borrowings", redirect:"/"},
                {path: "/FrontOffice/Sanctions", redirect:"/"},
                {path: "/FrontOffice/Creditline", redirect:"/"},
                {path: "/FrontOffice/Transactions", redirect:"/"},
                {path: "/login", redirect:"/"},
                {path: "/Operations", redirect:"/"}
            ]
        }
    ))
    .add('default', Default);
*/
