# Search component
Search bar with suggestions

## Import 
---
```js
import SearchBar from "@/components/SearchBar/SearchBar.vue"

export default{
    components: {
        SearchBar,
        //...
    }
    //...
}
```

## Usage
---

```html
<search-bar :modules="modules" baseurl="/FrontOffice"/>
```

## Props
---

|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|modules| the modules object in which input will be searched |`Object`|`true`|`null`|
|baseurl| the path of the current module(to check whether a clicked module is to be opened in a new tab) |`String`|`false`|`null`|



## Prop structure
---

### `modules`  
The modules that you need to search from. Can contain submodules under the `views` property. 
Example: 
```js
{
    FrontOffice:{
        caption:"Frontoffice",
        path:"/",
        order:"0",
        home:"Dashboard",
        views:{
            Dashboard:{
                caption:Dashboard,
                order:"1"
            },
            Borrowings:{
                caption:"Outstanding Borrowing Position",
                order:"2"
            }
        }
    },
    Operations:{
        caption:"Operations",
        path:"/",
        order:"0",
        home:"Dashboard",
        views:{
            Dashboard:{
                caption:"Dashboard",
                order:"1"
            }
        }
    }
}

```
Both the module name(the key of the module object) and the `caption` property will be searched.

### `baseurl` 
The baseurl is used to determine whether a clicked search suggestion is to be opened in a new tab. If `baseurl` is null, or if the path of the clicked view contains the `baseurl`, the view will be loaded in the current. If the path of the clicked view doesn't contain the `baseurl`(ie. it's in a different main module), then the view will be opened in a new tab.

Example: 
```html
<SearchBar :modules="modules" :baseurl="/Operations">
```

