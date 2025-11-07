import io from "socket.io-client";

var _nsocket;
if(config.notificationserver)
_nsocket = io(config.baseURL);
var onNotifyMsg;

const NC = function() {
    this._handlers = {};

    return {
        startSession: (userid, sessionid) => {
            this.userid = userid;
            this.sessionid = sessionid;

            _nsocket.on(
                "connect",
                function() {
                    // console.log(_nsocket,"==============");
                    "Connecting the N Center : " + this.userid + ":" + this.sessionid;
                    _nsocket.emit("startsession", {
                        userid: this.userid,
                        sessionid: this.sessionid
                    });
                }.bind(this)
            );

            _nsocket.on("session_validate", Obj => {
                // console.log("validarwe============");
                if (Obj.error) {
                    console.error(Obj.error);
                    _nsocket.disconnect();
                    return;
                }
                console.log("Notification Center Connected.");
                //Receive the Collection change data
                _nsocket.off("collectionChange");
                _nsocket.on("collectionChange", vObj => {
                    this._handlers[vObj.collection](vObj.data, null);
                });
                _nsocket.off("messages");
                //Receive the messages

                _nsocket.on("messages", vObj => {
                    // alert("msg");

                    onNotifyMsg ? onNotifyMsg(vObj) : "";
                });
            });

            //Connection error handling
            _nsocket.on(
                "collection_error",
                function(errObj) {
                    errObj.collection ?
                        this._handlers[errObj.collection](null, errObj.error) :
                        "";
                }.bind(this)
            );

            //Connection error handling
            _nsocket.on("connect_error", function(err) {
                console.error("Error connecting notification server");
            });

            //Socket disconnect event
            _nsocket.on("disconnect", function() {
                console.error("Disconnected from notification server");
            });
        },
        subMessages: callback => {
            onNotifyMsg = callback;
            _nsocket.emit("offlineMsgs", {
                userid: this.userid,
                sessionid: this.sessionid
            });
            return;
        },
        unsubMessages: () => {
            onNotifyMsg = null;
            return;
        },
        subCollection: (collection, callback) => {
            if (!collection && !callback) {
                console.error("Insufficient data(collection/callback)");
                return;
            }
            this._handlers[collection] = callback;
            _nsocket.emit("subCollection", {
                userid: this.userid,
                sessionid: this.sessionid,
                collection: collection
            });
        },
        unsubCollection: collection => {
            if (!collection) {
                console.error("Insufficient data(collection)");
                return;
            }
            _nsocket.emit("unsubCollection", {
                userid: this.userid,
                sessionid: this.sessionid,
                collection: collection
            });
            delete this._handlers[collection];
        },
        stopSession: () => {
            _nsocket.disconnect();
            _nsocket = null;
        }
    };
};
const NC_Fallback = function(){
    return {
        startSession: (userid, sessionid) => {
            console.log('Notifications is disabled...')
        },
        subMessages: callback => {
        },
        unsubMessages: () => {
        },
        subCollection: (collection, callback) => {
        },
        unsubCollection: collection => {
        },
        stopSession: () => {
        }
    }
}
export default config.notificationserver ? NC : NC_Fallback;