if(typeof browser == "undefined") {
    var browser = chrome;
}
var bground = {}

bground.model = {
    _messageBus: null
}

bground.ctrl = {
    onConnect: function (port) {
        console.assert(port.name == "remove.css.winona");
        bground.model._messageBus = port;
        port.onMessage.addListener(bground.ctrl.onMessage);
    },
    onMessage: function (msg) {
        console.log(msg);
        switch (msg.type) {
            case "extension.state": {
                bground.ctrl.extension.sendFrontend({
                    type: "extension.state",
                    data: {
                        "active": bground.ctrl.extension.isActive(),
                        "allcss": localStorage.getItem("extension.config.allcss"),
                        "inline": localStorage.getItem("extension.config.inline"),
                        "cssurl": localStorage.getItem("extension.config.css.url")
                    }
                });
                break;
            }
            case "ping": {
                bground.ctrl.extension.sendFrontend({type:'pong'});
                break;
            }
            default: {
                console.error('Unsupported message type : ' + msg.type);
            }
        }
    },
    storageChange: function(event) {
        //console.log(event);
        switch(event.key) {
            case "extension.active": {
                if(event.newValue == "t") {
                    bground.ctrl.extension.activate();
                } else {
                    bground.ctrl.extension.deactivate();
                }
                break;
            }
            case "extension.action": {
                var data = event.newValue.split("?")[0];
                //console.log(data);
                bground.ctrl.extension.sendFrontend({
                    "type": event.key,
                    "data": data
                });
                break;
            }
            case "extension.config.allcss":
            case "extension.config.inline":
            case "extension.config.css.url": {
                console.log(event);
                bground.ctrl.extension.sendFrontend({
                    type: event.key,
                    data: event.newValue
                });
                break;
            }
            default: {
                console.error(event);
            }
        }
    },
    extension: {
        sendFrontend: function(msg) {
            if (bground.model._messageBus != null) {
                bground.model._messageBus.postMessage(msg);
            }
        },
        isActive: function () {
            return localStorage.getItem("extension.active");
        },
        activate: function () {
            browser.browserAction.setIcon({path: "icons/16x16.png"});
            //console.log('extensionActivate');
            bground.ctrl.extension.sendFrontend({type: "extension.active", data: "t"})
        },
        deactivate: function () {
            browser.browserAction.setIcon({path: "icons/16x16.black.png"});
            //console.log('extensionDeactivate');
            bground.ctrl.extension.sendFrontend({type: "extension.active", data: "f"})
        },
    },
    initliazlie: function() {
        var active = localStorage.getItem("extension.active");
        if(active == null || active == "true" || active == "false") {
            localStorage.setItem("extension.active", "f");
            localStorage.setItem("extension.config.allcss", "f");
            localStorage.setItem("extension.config.inline", "t");
            active = "f";
        }
        if(active == "t") {
            // for old version
            localStorage.setItem("extension.active", "t");
            bground.ctrl.extension.activate();
        } else {
            // for old version
            localStorage.setItem("extension.active", "f");
            bground.ctrl.extension.deactivate();
        }
        //console.log(localStorage.getItem("extension.config.css.url"))
        window.addEventListener('storage', bground.ctrl.storageChange);
        browser.runtime.onConnect.addListener(bground.ctrl.onConnect);
    }
}

bground.ctrl.initliazlie();