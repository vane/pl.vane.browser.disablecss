if(typeof browser == "undefined") {
    var browser = chrome;
}
var removecss = {}
removecss.model = {
    messageBus: null,
    isActive: "f",
    cssurl: '',
    allcss: "f",
    removeInline: "f"
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
            removecss.ctrl.message.ping(5000);
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
                        removecss.ctrl.removeElements();
                    }
                    break;
                }
                case "extension.active": {
                    if (msg.data == "t") {
                        removecss.ctrl.removeElements();
                    }
                    removecss.model.isActive = msg.data;
                    break;
                }
                case "extension.action": {
                    if(msg.data == "remove.inline") {
                        removecss.ctrl.removeInline();
                    } else if (msg.data == 'remove.allcss') {
                        removecss.ctrl.removeElements();
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
                    removecss.ctrl.message.ping(5000);
                    break;
                }
                default: {
                    console.error('Unsupported message type : '+msg.type);
                }
            }
        },
        ping: function(interval) {
            setTimeout(function() {
                removecss.ctrl.message.sendBackend({type: "ping"});
            }, interval);
        },
        sendBackend: function(msg) {
            try {
                removecss.model.messageBus.postMessage(msg);
            } catch(err) {
                console.error(err);
                removecss.ctrl.message.init();
            }
        }
    },
    removeElements: function() {
        if(removecss.model.isActive) {
            setTimeout(function () {
                removecss.ctrl.removeElements();
            }, 5000);
        }
        if(document && (document.readyState == "complete" || document.readyState == "loaded")) {
            removecss.ctrl.removeAfterLoaded();
        } else {
            window.addEventListener('DOMContentLoaded', function () {
                removecss.ctrl.removeAfterLoaded();
            });
        }
    },
    removeAfterLoaded: function() {
        if(removecss.model.allcss == "t") {
            var elements = document.querySelectorAll('link[rel=stylesheet]');
            for (var i = 0; i < elements.length; i++) {
                elements[i].parentNode.removeChild(elements[i]);
            }
            [].slice.call(document.getElementsByTagName('style')).forEach(function(el) {
                el.parentNode.removeChild(el);
            });
            removecss.ctrl.removeInline();
        }
        if(removecss.model.removeInline == "t") {
            removecss.ctrl.removeInline();
        }
        if(removecss.model.cssurl != null) {
            removecss.ctrl.applyStyle();
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
            if(el.hasAttribute("bgColor")) {
                el.removeAttribute("bgColor");
            }
        });
    }
}

removecss.ctrl.message.init();