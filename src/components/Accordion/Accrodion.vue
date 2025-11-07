<template>
      <b-card no-body :class="{ 'active': isActive }" @click="toggleAccordion" id="accordionCard" class="scroll-y">
        <b-card-header :class="{ 'btn-active': isActive }">
          {{ title }}
          <b-icon
            :icon="isActive ? 'caret-up' : 'caret-down'"
            class="float-right"
            :class="{'blue' : isActive}"
          ></b-icon>
        </b-card-header>
        <b-collapse v-model="isActive">
          <b-card-body class="scroll-y">
            <slot></slot>
          </b-card-body>
        </b-collapse>
      </b-card>
</template>
  
  <script>
    export default {
        props: {
        title: String,
        },
        data() {
        return {
            isActive: false,
        };
        },
        methods: {
        toggleAccordion() {
            this.isActive = !this.isActive;
        },
        },
    };
  </script>
  
  <style scoped lang="scss">
    .active {
        background-color: #f8f9fa;
        border-radius: 5px;
        margin-bottom: 10px;
    }

   .btn-active{
        transition: 200ms ease-in-out;
        background-color: #e7f1ff !important;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.125);
    }


    .blue{
        color: blue;
    }

    .card-body{
        background: #fff;
    }

    
    #accordionCard ::v-deep{
        .card-header{
            background: #fff;
            /* font-size: 1.1rem;
            font-weight: 600; */
            padding: 1rem 1.25rem !important;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            &:focus{
                z-index: 3;
                border-color: #86b7fe;
                outline: 0;
                box-shadow: 0 0 0 0.35rem rgba(13,110,253,.25);
            }
        }
    }
			
  </style>
  