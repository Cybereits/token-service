(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.apolloLink = global.apolloLink || {}, global.apolloLink.zenObservable = {})));
}(this, (function (exports) { 'use strict';

var Observable = require('zen-observable');

exports.default = Observable;
exports.Observable = Observable;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=bundle.umd.js.map
