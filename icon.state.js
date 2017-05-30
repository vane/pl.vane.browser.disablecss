iconstate = {}

iconstate.ctrl = {
    onActivate: function (e) {
        var state = iconstate.ctrl.extension.isActive();
        if (state == "t") {
            iconstate.ctrl.extension.deactivate();
        } else {

            iconstate.ctrl.extension.activate();
        }
    },
    onCustomCSS: function() {
        var input = document.getElementById('cssurl_input');
        if(input.value.trim() == "") {
            iconstate.ctrl.extension.setCustomURL(null);
        } else {
            iconstate.ctrl.extension.setCustomURL(input.value);
        }
    },
    changeActiveState: function(state) {
        var btn = document.getElementById('active_btn');
        var img = document.getElementById('active_icon');
        if(state == "t") {
            btn.innerHTML = "Dectivate";
            img.src = "icons/48x48.png";
            btn.className = "btn btn_active";
        } else {
            btn.innerHTML = "Activate";
            btn.className = "btn btn_inactive";
            img.src = "icons/48x48.black.png";
        }
    },
    toBool: function(e) {
        if(e.target.checked == "true" || e.target.checked == true) {
            return "t"
        }
        return "f"
    },
    extension: {
        setRemoveSheets: function(value) {
            localStorage.setItem('extension.config.allcss', value);
        },
        setRemoveInline: function(value) {
            localStorage.setItem('extension.config.inline', value);
        },
        setAction: function(value) {
            localStorage.setItem('extension.action', value);
        },
        setCustomURL: function(url) {
            if(url == null) {
                return;
            }
            if(url.indexOf('?') != -1) {
                localStorage.setItem('extension.config.css.url', url+'&winona='+(new Date().getTime()));
            } else {
                localStorage.setItem('extension.config.css.url', url+'?'+(new Date().getTime()));
            }

        },
        getCssUrl: function() {
            return localStorage.getItem('extension.config.css.url');
        },
        isAllCSS: function() {
            return localStorage.getItem('extension.config.allcss')
        },
        isInline: function() {
            return localStorage.getItem('extension.config.inline')
        },
        activate: function () {
            localStorage.setItem("extension.active", "t");
            iconstate.ctrl.changeActiveState("t");
        },
        deactivate: function () {
            localStorage.setItem("extension.active", "f");
            iconstate.ctrl.changeActiveState("f");
        },
        isActive: function () {
            return localStorage.getItem("extension.active");
        }
    },
    gui: {
        loaded: function () {
            var active_btn = document.getElementById('active_btn');
            var close_btn = document.getElementById('close_btn');
            var customcss_btn = document.getElementById('customcss_btn');
            var sheets_btn = document.getElementById('sheets_btn');
            var inline_btn = document.getElementById('inline_btn');

            // input data
            var cssurl = iconstate.ctrl.extension.getCssUrl();
            if(cssurl != null) {
                var cssurl_input = document.getElementById('cssurl_input');
                cssurl_input.value = cssurl;
            }
            var removesheets_input = document.getElementById('removesheets_input');
            var removeinline_input = document.getElementById('removeinline_input');
            if(iconstate.ctrl.extension.isAllCSS() == "t") {
                removesheets_input.setAttribute("checked", "checked")
            }
            if(iconstate.ctrl.extension.isInline() == "t") {
                removeinline_input.setAttribute("checked", "checked")
            }

            removesheets_input.addEventListener('change', function(e){
                var val = iconstate.ctrl.toBool(e);
                iconstate.ctrl.extension.setRemoveSheets(val);
            });

            removeinline_input.addEventListener('change', function(e) {
                var val = iconstate.ctrl.toBool(e);
                iconstate.ctrl.extension.setRemoveInline(val);
            })

            // btn listeners
            inline_btn.addEventListener('click', function(){
                iconstate.ctrl.extension.setAction('remove.inline?'+(new Date().getTime()));
            })
            sheets_btn.addEventListener('click', function() {
                iconstate.ctrl.extension.setAction('remove.allcss?'+(new Date().getTime()));
            })
            iconstate.ctrl.changeActiveState(iconstate.ctrl.extension.isActive());
            active_btn.addEventListener('click', iconstate.ctrl.onActivate);
            customcss_btn.addEventListener('click', iconstate.ctrl.onCustomCSS);
            close_btn.addEventListener('click', function(){
                window.close();
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', iconstate.ctrl.gui.loaded);