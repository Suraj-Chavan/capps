const user = {
  "userid": sessionStorage.getItem("userid"),
  "sessionid": sessionStorage.getItem("sessionid")
}
const jsonserverCreate = function(requestURL, data) {
  const body = {user, ...data}
  return fetch(requestURL, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => window.alert(JSON.stringify(error)));
};

const jsonserverRead = function(url, query) {
  const processQuery = function(querydetails) {
    var result = "";
    if (querydetails.id) result += `/${querydetails.id}`;
    if (querydetails.start) {
      if (!querydetails.end) querydetails.end = querydetails.start + 20;
      result += `&_start=${querydetails.start}&_end=${querydetails.end}`;
    }
    const operatormap = { $lte: "_lte", $gte: "_gte", $eq: "" };
    if (querydetails.filter) {
      result += `&user=${JSON.stringify(user)}`
      Object.keys(querydetails.filter).forEach((key) => {
        var condition = querydetails.filter[key];
        if (typeof condition === "object") {
          // result += `&${key}${operatormap[Object.keys(condition)[0]]}=${ @Vijay sir
          //   condition[Object.keys(condition)[0]]
          // }`;
          result += `&${key}=${JSON.stringify(condition)}`;
        } else {
          result += `&${key}=${querydetails.filter[key]}`;
        }
      });
    }

    return result;
  };
  var requestURL = url;
  if (query) requestURL += "?" + processQuery(query);
  return fetch(requestURL)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => window.alert(JSON.stringify(error)));
};
const jsonserverUpdate = function(url, query) {
  var requestURL = url;
  if (query.id) requestURL += `/${query.id}`;

  query.user = user


  return fetch(requestURL, {
    method: "PUT", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query), // body data type must match "Content-Type" header
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => window.alert(JSON.stringify(error)));
};

const jsonserverDelete = function(url, query) {
  var requestURL = url;
  // if (query.id) requestURL += `/${query.id}`; @Vijay Sir
  query.user = user

  return fetch(requestURL, {
    method: "DELETE",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => window.alert(JSON.stringify(error)));
};


const NREST_POST = function(requestURL, data) {
  const body = data.filter ? {user, ...data.filter} : {user, ...data}
  return fetch(requestURL, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => window.alert(JSON.stringify(error)));
};

export default (options) => {
  var baseurl = options ? options.baseurl || "" : "";
  var serverType = options.servertype || "jsonserver";

  var fetchCreate, fetchRead, fetchUpdate, fetchDelete;

  if (serverType === "jsonserver") {
    fetchCreate = jsonserverCreate;
    fetchRead =   jsonserverRead;
    fetchUpdate = jsonserverUpdate;
    fetchDelete = jsonserverDelete;
  } 
  else {
    fetchCreate = NREST_POST;
    fetchRead =   NREST_POST;
    fetchUpdate = NREST_POST;
    fetchDelete = NREST_POST;
  }
  var systemEvents = new EventTarget();
  var user = new Object({ update() {} });
  return {
    user: user,
    subscribe(eventname, handler) {
      systemEvents.addEventListener(eventname, handler);
      return eventname;
    },
    publish(eventname) {
      var aevent = new Event(eventname);
      systemEvents.dispatchEvent(aevent);
      return aevent;
    },
    unsubscribe(eventname, handler) {
      systemEvents.removeEventListener(eventname, handler);
      return true;
    },
    async login(details) {
      return fetchRead(`${baseurl}/users`, {
        filter: { name: { $eq: details.username }, password: details.password },
      }).then((data) => {
        if (data.length > 0) {
          data.datetime = Date.now()
          localStorage.setItem("userToken", data);
          this.loggedIn = true;
          this.user = Object.assign(this.user, data[0]);
          systemEvents.dispatchEvent(new Event("login"));
          return true;
        } else return false;
      });
    },
    async logout() {
      localStorage.removeItem("userToken");
      systemEvents.dispatchEvent(new Event("logout"));
      this.loggedIn = false;
      return true;
    },
    loggedIn:  false,
    collection(collName) {
      return {
        create(data) {
          return fetchCreate(`${baseurl}/${collName}`, data);
        },
        read(data) {
          return fetchRead(`${baseurl}/${collName}`, data);
        },
        readone(id) {
          return fetchRead(`${baseurl}/${collName}/${id}`);
        },
        update(data) {
          return fetchUpdate(`${baseurl}/${collName}`, data);
        },
        delete(data) {
          //return fetchDelete(`${baseurl}/${collName}/${id}`); @Vijay Sir
          return fetchDelete(`${baseurl}/${collName}`, data);
        },
      };
    },
  };
};
