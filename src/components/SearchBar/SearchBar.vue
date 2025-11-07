<template>
    <b-navbar-nav class="d-flex flex-column">
        <b-form-input placeholder="Search" class="h-searchbar" @input="onSearchInput" @mouseleave="setSearchSugDisplay('none')" ref="searchInput">
        </b-form-input>
        <div class="search-suggestions" id="search-sug" @mouseenter="setSearchSugDisplay('block')" ref="searchSugg">
            <div v-for="(sugg,index) in searchSugg" :key="index" class="p-2" @click="onSearchSuggClick(sugg)">
            {{sugg.caption}}
            <small>({{sugg.mod}})</small>
            </div>
        </div>
    </b-navbar-nav>
    
</template>


<script>

const debounce = function(fn,delay){
  let timer;
  return function(){
    let context = this;
    let args = arguments;

    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(context,args), delay);
  }
}

export default {
    name: "SearchBar",
    props: {
        modules: {
            type: Object,
            required: true,
            default: null
        },
        baseurl: {
            type: String,
            required: false,
            default: null
        },
        menuList: {
			type: [Array, String],
            default: ""
		}   
    },
    data: () => ({
        searchSugg: [],
        searchObj: {}
    }),
    mounted(){
        document.body.appendChild(this.$refs.searchSugg);
        this.createSearchArr();
        // console.log(this.$refs);
    },
    methods:{

        positionSearchSuggestions(){
            const searchSug = this.$refs.searchSugg;
            if(searchSug.style.display != "block"){
                const searchBarPos = this.$refs.searchInput.$el.getBoundingClientRect();
                this.setSearchSugDisplay("block");
                searchSug.style.top = `${searchBarPos.bottom}px`;
                searchSug.style.left = `${searchBarPos.left}px`;
            }
        }, 

        setSearchSugDisplay(display){
            this.$refs.searchSugg.style.display = display;
        },

        onSearchSuggClick(sugg){
            this.$refs.searchInput.$el.value = "";
            this.searchSugg = [];
            this.setSearchSugDisplay('none');
            if(!sugg.baseurl)
                this.$router.push(sugg.path);
            else{
                if(sugg.path.indexOf(sugg.baseurl) >= 0){
                    this.$router.push(sugg.path);
                }
                else{
                    let link = this.$router.resolve(sugg.path);
                    window.open(link.href, '_blank');
                }
                
            }
        },
        search(e){
            this.searchSugg = [];
            
            Object.keys(this.searchObj).forEach(key => {
                
                let mod = this.searchObj[key];
            
                Object.keys(mod.views).forEach(view => {
                let searchStr = `${key};${mod.views[view].path};${mod.views[view].caption}`.toLowerCase();

                if(searchStr.indexOf(e.toLowerCase()) >= 0){
                    this.searchSugg.push({
                        mod: key,
                        path: `/${mod.path}/${mod.views[view].path}`,
                        caption: mod.views[view].caption
                    });
                }
                
                });
            });

            if(this.menuList){
                this.menuList.forEach(menu => {
                    // menu.children.forEach(child => {
                        let searchStr = `${menu.APP_NAME}`.toLowerCase();
                        if(searchStr.indexOf(e.toLowerCase()) >= 0){
                            this.searchSugg.push({
                                mod: menu.APP_NAME,
                                path: menu.APP_PAGE,
                                caption: menu.APP_NAME,
                                baseurl: this.$route.path.replace(/\/$/, '')
                            })
                        }
                    // });
                })
            }

            if(this.searchSugg.length == 0) this.setSearchSugDisplay("none");
        },
        onSearchInput: debounce(function(e){
            if(!e || e == ""){
                this.setSearchSugDisplay("none");
            }
            else {
                this.positionSearchSuggestions();
                this.search(e);
            }
        },500),

        createSearchArr(){
            let searchObj = {};
            Object.keys(this.modules).forEach(key => {
            searchObj[key] = {
                path: key,
                views:{}
            };
            Object.keys(this.modules[key].views).forEach(k => {
                searchObj[key].views[k] = {
                path: k,
                caption: this.modules[key].views[k].caption,
                };
            });
            });
            this.searchObj = searchObj;
        },
    }
}
</script>

<style lang="scss" scoped>
    .h-searchbar{
    width: 200px;
    border: 1px solid rgba(255,255,255,0.2);
    background: url("./assets/search_white.png") no-repeat 95% rgb(0,0,0,0);
    color: white;
  }
    
  .search-suggestions{
    z-index: 10;
    width: 300px;
    background-color: white;
    position: absolute;
    display: none;
    border: 1px solid gray;
    box-shadow: 0px 5px 8px #eeeeee;

    div{
      cursor: pointer;
      
      &:hover{
        background-color: #eeeeee;
      }
    }
  }
</style>