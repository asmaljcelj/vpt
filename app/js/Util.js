var Util = (function() {
'use strict';

function noop() {
}

function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}

function lerp(a, b, x) {
    return a + x * (b - a);
}

function downloadJSON(json, filename) {
    var str = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json));
    var a = document.createElement('a');
    a.setAttribute('href', str);
    a.setAttribute('download', filename);
    a.click();
    a = null;
}

function inherit(sub, sup) {
    sub.prototype = Object.create(sup.prototype);
    sub.prototype.constructor = sub;
    sub.prototype.sup = sup.prototype;
    sub.sup = sup;
}

var noimpl = new Error('Not implemented!');

return {
    noop: noop,
    clamp: clamp,
    lerp: lerp,
    downloadJSON: downloadJSON,
    inherit: inherit,
    noimpl: noimpl
};

})();