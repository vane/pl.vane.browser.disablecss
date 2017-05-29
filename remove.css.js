if(typeof browser == "undefined") {
    var browser = chrome;
}
var removecss = {}
removecss.model = {
    messageBus: null,
    isActive: "false",
    cssurl: '',
    allcss: "false",
    removeInline: "false"
}

removecss.ctrl = {
    message: {
        init: function() {
            if(removecss.model.messageBus != null) {
                removecss.model.messageBus.onMessage.removeListener(removecss.ctrl.message.listener)
                removecss.model.messageBus = null;
            }
            removecss.model.messageBus = browser.runtime.connect({name: "remove.css.winona"});
            removecss.ctrl.message.sendBackend({type: "extension.state"});
            removecss.model.messageBus.onMessage.addListener(removecss.ctrl.message.listener);
        },
        listener:function (msg) {
            console.log(msg);
            switch(msg.type){
                case "extension.state": {
                    removecss.model.isActive = msg.data.active;
                    removecss.model.allcss = msg.data.allcss;
                    removecss.model.removeInline = msg.data.inline;
                    removecss.model.cssurl = msg.data.cssurl;
                    if(msg.data.active == "t") {
                        removecss.ctrl.removeData(false);
                        window.addEventListener('DOMContentLoaded', function () {
                            removecss.ctrl.removeData(true);
                        });
                    }
                    break;
                }
                case "extension.active": {
                    if (msg.data == "t") {
                        removecss.ctrl.removeData(false);
                        window.addEventListener('DOMContentLoaded', function () {
                            removecss.ctrl.removeData(true);
                        });
                    }
                    removecss.model.isActive = msg.data;
                    break;
                }
                case "extension.action": {
                    if(msg.data == "remove.inline") {
                        removecss.ctrl.removeInline();
                    } else if (msg.data == 'remove.allcss') {
                        removecss.ctrl.removeAll();
                    }
                    break;
                }
                case "extension.config.allcss": {
                    removecss.model.allcss = msg.data;
                    break;
                }
                case "extension.config.inline": {
                    removecss.model.removeInline = msg.data;
                    break;
                }
                case "extension.config.css.url": {
                    removecss.model.cssurl = msg.data;
                    removecss.ctrl.applyStyle();
                    break;
                }
                case "pong": {
                    // test connection here
                    setTimeout(function() {
                        removecss.ctrl.message.sendBackend({type: "ping"});
                    }, 5000);
                    break;
                }
                default: {
                    console.error('Unsupported message type : '+msg.type);
                }
            }
        },
        sendBackend: function(msg) {
            try {
                removecss.model.messageBus.postMessage(msg);
            } catch(err) {
                console.error(err);
                removecss.model.messageBus.init();
            }
        }
    },
    removeData: function(isEvent) {
        if(isEvent == false) {
            if(removecss.model.allcss == "t") {
                removecss.ctrl.removeAll();
            }
        } else {
            if(removecss.model.removeInline == "t") {
                removecss.ctrl.removeInline();
            }
            if(removecss.model.cssurl != null) {
                removecss.ctrl.applyStyle();
            }
        }
    },
    applyStyle: function() {
        var http = new XMLHttpRequest();
        http.onreadystatechange = function() {
            if (http.readyState == 4 && http.status == 200) {
                var css = http.responseText;
                var head = document.head || document.getElementsByTagName('head')[0];
                var style = document.createElement('style');
                style.type = 'text/css';
                if (style.styleSheet){
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
                head.appendChild(style);
            }
        };
        http.open("GET", removecss.model.cssurl, true);
        http.send();
    },
    removeInline: function() {
        [].slice.call(document.getElementsByTagName('*')).forEach(function (el) {
            el.style = "";
            // TODO restore state
            if(el.hasAttribute("bgColor")) {
                el.removeAttribute("bgColor");
            }
        });
    },
    removeAll: function() {
        // TODO restore state
        var elements = document.querySelectorAll('link[rel=stylesheet]');
        for (var i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }
        [].slice.call(document.getElementsByTagName('style')).forEach(function(el) {
            el.parentNode.removeChild(el);
        });
    }
}

removecss.ctrl.message.init();