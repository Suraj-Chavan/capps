const user = {
	userid: sessionStorage.getItem("user_id"),
	sessionid: sessionStorage.getItem("_ticket")
};
const isFunction = (fn) => ({}).toString.call(fn) === "[object Function]";
const isPlainObject = obj => ({}).toString.call(obj) === '[object Object]';
const isProduction = process.env.NODE_ENV === "production";

function getFilenameFromContentDisposition(headerValue) {
  if (!headerValue) return null;

  // Check for RFC 5987 encoded filename*
  const filenameStarMatch = headerValue.match(/filename\*\s*=\s*([^;]+)/i);
  if (filenameStarMatch) {
    const encodedFilename = filenameStarMatch[1].trim();
    const parts = encodedFilename.split("''", 2);
    if (parts.length === 2) {
      // Decode percent-encoded UTF-8 filename
      return decodeURIComponent(parts[1]);
    }
    return encodedFilename;
  }

  // Check for standard filename
  const filenameMatch = headerValue.match(/filename\s*=\s*("?)([^";]+)\1/i);
  if (filenameMatch) {
    return filenameMatch[2];
  }

  return null;
}

function handleErrors(response) {
	if (!response.ok) {
		if (response.status == 400) {
			return response.json().then(data => {
				console.error(data.data.errors);
				throw new Error(JSON.stringify(data.data.errors));
			});
		} else if (response.status === 401) {
			if(isProduction) {

				if (window.self !== window.top) window.parent.location.href = "/";
				else window.location.href = "/"
				sessionStorage.clear();
			}
		}
		else throw new Error(JSON.stringify(response.statusText));
	}
	return response;
};
const jsonserverCreate = function (requestURL, data) {
	const body = { user, ...data };
	return fetch(requestURL, {
		method: "POST",
		headers: {
			Accept: "application/json, text/plain, */*",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	})
		.then(handleErrors)
		.then(response => {
			return response.json();
		})
		.then(data => {
			return data;
		})
		.catch(error => console.error(JSON.stringify(error)));
};
const jsonserverRead = function (url, query) {
	const processQuery = function (querydetails) {
		var result = "";
		if (querydetails.id) result += `/${querydetails.id}`;
		if (querydetails.start) {
			if (!querydetails.end) querydetails.end = querydetails.start + 20;
			result += `&_start=${querydetails.start}&_end=${querydetails.end}`;
		}
		const operatormap = { $lte: "_lte", $gte: "_gte", $eq: "" };
		if (querydetails.filter) {
			result += `&user=${JSON.stringify(user)}`;
			Object.keys(querydetails.filter).forEach(key => {
				var condition = querydetails.filter[key];
				if (typeof condition === "object") {
					result += `&${key}=${encodeURIComponent(JSON.stringify(condition))}`;
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
		.then(handleErrors)
		.then(response => {
			return response.json();
		})
		.then(data => {
			return data;
		})
		.catch(error => console.error(JSON.stringify(error)));
};
const jsonserverUpdate = function (url, query) {
	var requestURL = url;
	if (query.id) requestURL += `/${query.id}`;

	query.user = user;

	return fetch(requestURL, {
		method: "PUT", // *GET, POST, PUT, DELETE, etc.
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(query) // body data type must match "Content-Type" header
	})
		.then(handleErrors)
		.then(response => {
			return response.json();
		})
		.then(data => {
			return data;
		})
		.catch(error => console.error(JSON.stringify(error)));
};
const jsonserverDelete = function (url, query) {
	var requestURL = url;
	// if (query.id) requestURL += `/${query.id}`; @Vijay Sir
	query.user = user;

	return fetch(requestURL, {
		method: "DELETE",
		headers: {
			Accept: "application/json, text/plain, */*",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(query)
	})
		.then(handleErrors)
		.then(response => {
			return response.json();
		})
		.then(data => {
			return data;
		})
		.catch(error => console.error(JSON.stringify(error)));
};

const requestor = defaults => ( requestURL, options = {} ) => {
	if(isPlainObject(options) === false) options = {};
	const onError = options.onError; delete options.onError;
	let contentType = "application/json;";
	const IS_MULTIPART = options?.configurations?.multiPart === true;
	// merging defaults and other passed options, and deep merging body and headers.
	options = Object.assign(
		{}, 
		defaults, 
		options, 
		{ 
			headers : { ...defaults.headers, ...options.headers } 
		},
		IS_MULTIPART ? {} : { body: JSON.stringify({ ...defaults.body, ...options.body }) }
	);

	if(IS_MULTIPART && !options?.configurations?.applyHeaders) {
		delete options.headers["Content-Type"];
		delete options.headers["Accept"];
	}
	
	return fetch(requestURL, options)
	.then(response => {
		handleErrors(response);
		if(response && response.headers && isFunction(response.headers.get)) contentType = "" + response.headers.get("Content-Type");
		if(options?.configurations?.parseText) return response.text();
		if(options?.configurations?.parseBlob) return response.blob();
		if (contentType.includes("application/json;")) return response.json();
		if(options?.configurations?.processBlob) return options.configurations.processBlob(response, getFilenameFromContentDisposition);
		return response.blob();
	})
	.catch(error => {
		console.error(JSON.stringify(error));
		isFunction(onError) && onError(error);
		return {error, status: "unsuccess"};
	});
}

// Defaulting the headers ...
const NREST_POST = requestor({
	method: "POST",
	headers: {
		Accept: "application/json, text/plain, */*",
		"Content-Type": "application/json",
		"sessionid": sessionStorage.getItem("_ticket")
	},
	body: {}
});


export default options => {
	var baseurl = options ? (options.baseurl || "") : "",
		serverType = options.servertype || "jsonserver",
		fetchCreate = null, 
		fetchRead = null, 
		fetchUpdate = null, 
		fetchDelete = null,
		systemEvents = new EventTarget(), 
		user = new Object({ update() { } });

	switch(serverType) {
		case "jsonserver":
			fetchCreate = jsonserverCreate,
			fetchRead = jsonserverRead,
			fetchUpdate = jsonserverUpdate,
			fetchDelete = jsonserverDelete
			break;
		default:
			fetchCreate = fetchRead = fetchUpdate = fetchDelete = NREST_POST;
			break;
	}

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
				//  filter: { name: { $eq: details.username }, password: details.password },
				filter: { name: details.username, password: details.password }
			}).then(data => {
				if (data.length > 0) {
					data.datetime = Date.now();
					localStorage.setItem("userToken", data);
					this.loggedIn = true;
					this.user = Object.assign(this.user, data[0]);

					systemEvents.dispatchEvent(
						new CustomEvent("login", { detail: { user: this.user } })
					);
					return true;
				} else return false;
			});
		},
		async logout() {
			localStorage.removeItem("userToken");
			sessionStorage.clear();
			// systemEvents.dispatchEvent(new Event("logout"));
			this.loggedIn = false;
			return true;
		},
		loggedIn: true,
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
					return fetchDelete(`${baseurl}/${collName}`, data);
				}
			};
		}
	};
};