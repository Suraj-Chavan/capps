<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M13.5693 3.09981L13.9204 3.45085L13.5693 3.09981L3.09993 13.5692C2.75251 13.9166 2.75251 14.4799 3.09993 14.8273C3.44735 15.1747 4.01064 15.1748 4.35806 14.8273L14.8275 4.35794C15.1749 4.01052 15.1749 3.44724 14.8275 3.09982C14.48 2.75239 13.9167 2.75239 13.5693 3.09981Z" :fill="fillColor" :stroke="stroke"/>
  <path d="M13.5693 14.8273C13.9167 15.1748 14.48 15.1747 14.8275 14.8273C15.1749 14.4799 15.1749 13.9166 14.8275 13.5692L4.35806 3.09981C4.01064 2.75239 3.44735 2.75239 3.09993 3.09982C2.75251 3.44724 2.75251 4.01052 3.09993 4.35794L13.5693 14.8273Z" :fill="fillColor" :stroke="stroke"/>
</svg>
</template>
<script>
export default {
    name: 'close-svg',
    props: {
        fillColor:{
            type: String,
            default: '#FFF'
        },
        stroke: {
            type: String,
            default: '#FFF'
        }
    }
}
</script>