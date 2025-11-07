# Client SDK for credence REST API
The objective is to provide an easy to use client SDL library to allow app developer to avoid making ajax requests and handling web tokens. The library should provide  easy helper function allowing app developer to access the API easily. The API is expected to stick to REST standards or be **Resty**.

## How to use 
The library exports a constructor function that can be called to create an API object.

```js
import credCAPI from './utils/credCAPI'
Vue.prototype.$credCAPI =credCAPI({baseurl: 'http://localhost:3000'});
```

As of now the function takes only two options  

- baseurl - base URL to be set. This can be used to set JSON server during development
- servertype - Can be 'jsonserver' or 'apiserver'  default value is 'jsonserver'. 


Details of various functions are given below.

#### collection
Collection function is a constructor for creating a REST API end point access. Following example shows usage. 

```js
    this.dashboardcollection = this.$credCAPI.collection('datastore')
    this.dashboardcollection.readone('dashboards')
```

The function resturns an object with the following functions.

> - Create - to access create a new item in a REST collection
> - Read - to read a REST collection
> - readone - to read one item in REST collection
> - Update - to update an item in REST collection
> - Delete - to delete an item in REST collection


#### Payload
Read/Create/Update operation accepts your payload object with body key.

```js
credCAPI.collection('users').read({ body : { name: 'vijay', employeeID : 50 } })
```
The CredApi set some headers by default that default headers can be overriden by providing headers in your payload with key as `headers` with `body` key.
The reason you may want to override headers is to change content type to download blob files or other related content-type related files , object , blob etc.

```js
credCAPI.collection('users').read({ body : { name: 'vijay', employeeID : 50 }, headers: { Accepts: "text/csv"} });
```

CredApi's default  `headers` and `body`.

```js
var DEFAULT_PAYLOAD_OPTION = {
	method: "POST",
	headers: {
		Accept: "application/json, text/plain, */*",
		"Content-Type": "application/json",
		"sessionid": sessionStorage.getItem("_ticket")
	},
	body: {
		user
	}
}
```
