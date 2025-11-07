import FormElementWithValidation from "@/components/FormElementWithValidation.vue"
import { action } from '@storybook/addon-actions';

export default {
    title: "FormElementWithValidation",
    component: FormElementWithValidation,
    argTypes:{
        dataset:{control: 'array'},
        item:{control: 'object'}
    }
}

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    components: {FormElementWithValidation},
    template: `
        <div style="width: 300px; background-color: white; padding: 5px;">
            <FormElementWithValidation v-bind="$props" @input="onInput"/>
        </div>
    `,
    methods:{
        onInput: action('input')
    }
});

export const select = Template.bind({});
select.args = {
    dataset: [{"symbol":"Commercial Paper","transactiontypecode":16,"marketsymbol":"CP1","tradetype":null,"discounted_flag":null,"default_tenor":0,"mm_workflow":null},{"symbol":"Long Term Unsecured","transactiontypecode":16,"marketsymbol":"Long Term Unsecured","tradetype":null,"discounted_flag":null,"default_tenor":0,"mm_workflow":null},{"symbol":"CBLO","transactiontypecode":16,"marketsymbol":"CBLOB","tradetype":"-1","discounted_flag":"T","default_tenor":0,"mm_workflow":"1"},{"symbol":"Call Money","transactiontypecode":16,"marketsymbol":"CallMB","tradetype":"-1","discounted_flag":"F","default_tenor":0,"mm_workflow":"4"},{"symbol":"Notice Money","transactiontypecode":16,"marketsymbol":"NMB","tradetype":"-1","discounted_flag":"F","default_tenor":0,"mm_workflow":"4"},{"symbol":"Term Money","transactiontypecode":16,"marketsymbol":"TMB","tradetype":"-1","discounted_flag":"F","default_tenor":0,"mm_workflow":"4"},{"symbol":"Inter Corporate Deposit","transactiontypecode":16,"marketsymbol":"SICDB","tradetype":"-1","discounted_flag":"F","default_tenor":0,"mm_workflow":"4"},{"symbol":"Refinance","transactiontypecode":16,"marketsymbol":"REFB","tradetype":"-1","discounted_flag":"F","default_tenor":0,"mm_workflow":"2"},{"symbol":"MSF","transactiontypecode":16,"marketsymbol":"MSFB","tradetype":"-1","discounted_flag":"F","default_tenor":0,"mm_workflow":"3"},{"symbol":"Term LAF","transactiontypecode":16,"marketsymbol":"TLAFB","tradetype":"-1","discounted_flag":"F","default_tenor":0,"mm_workflow":"3"},{"symbol":"TREPS","transactiontypecode":16,"marketsymbol":"TREPB","tradetype":"1","discounted_flag":"T","default_tenor":0,"mm_workflow":"1"},{"symbol":"Repo","transactiontypecode":16,"marketsymbol":"REPB","tradetype":"1","discounted_flag":"F","default_tenor":0,"mm_workflow":"6"},{"symbol":"Re Repo","transactiontypecode":16,"marketsymbol":"RERPB","tradetype":"1","discounted_flag":"F","default_tenor":0,"mm_workflow":"6"},{"symbol":"Fixed Deposit","transactiontypecode":16,"marketsymbol":"FDB","tradetype":"-1","discounted_flag":"F","default_tenor":0,"mm_workflow":"5"},{"symbol":"LTRO","transactiontypecode":16,"marketsymbol":"LTRB","tradetype":"-1","discounted_flag":"F","default_tenor":0,"mm_workflow":"3"}],
    item: {"type":"select","ds":"ds-mm_product","ds-code":"symbol","ds-name":"symbol","label":"Product","placeholder":"Enter Product","name":"subproduct","rules":"required"}
}

export const number = Template.bind({});
number.args = {
    item: {"type":"number","label":"Issue Size","placeholder":"Enter Issue Size","name":"amount_leg1","rules":"required","class":"span50"}
}

export const date = Template.bind({});
date.args = {
    item: {"type":"date","label":"Trade Date","placeholder":"Date","name":"tradedate","rules":"required","class":"span50"}
}

export const time = Template.bind({});
time.args = {
    item: {"type":"time","label":"Trade Time","placeholder":"Time","name":"tradetime","rules":"required","class":"span50"}
}

export const days = Template.bind({});
days.args = {
    item: {"type":"day","label":"No of Days","placeholder":"No of Days","name":"contractperiod","rules":"required","class":"span50"}
}