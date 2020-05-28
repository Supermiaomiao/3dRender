const log = console.log.bind(console)

const _e = (sel) => document.querySelector(sel)

var _es = sel => document.querySelectorAll(sel)

const appendHtml = function(element, html) {
    element.insertAdjacentHTML('beforeend', html)
}

const bindEvent = function(element, eventName, callback) {
    element.addEventListener(eventName, callback)
}
const bindAll = function(sel, eventName, callback) {
    var l = _es(sel)
    for (var i = 0; i < l.length; i++) {
        var input = l[i]
        input.addEventListener(eventName, function(event) {
            callback(event)
        })
    }
}
