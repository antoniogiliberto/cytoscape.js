/**
 * Copyright (c) 2016-2022, The Cytoscape Consortium.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the “Software”), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

var is = require('./is.js');
var Core = require('./core/index.js');
var extension = require('./extension.js');
var Stylesheet = require('./stylesheet.js');
var version = require('./version.js');
var index_js = require('./util/index.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var is__namespace = /*#__PURE__*/_interopNamespace(is);
var Core__default = /*#__PURE__*/_interopDefaultLegacy(Core);
var extension__default = /*#__PURE__*/_interopDefaultLegacy(extension);
var Stylesheet__default = /*#__PURE__*/_interopDefaultLegacy(Stylesheet);
var version__default = /*#__PURE__*/_interopDefaultLegacy(version);

var cytoscape = function cytoscape(options) {
  // if no options specified, use default
  if (options === undefined) {
    options = {};
  } // create instance


  if (is__namespace.plainObject(options)) {
    return new Core__default["default"](options);
  } // allow for registration of extensions
  else if (is__namespace.string(options)) {
    return extension__default["default"].apply(extension__default["default"], arguments);
  }
}; // e.g. cytoscape.use( require('cytoscape-foo'), bar )


cytoscape.use = function (ext) {
  var args = Array.prototype.slice.call(arguments, 1); // args to pass to ext

  args.unshift(cytoscape); // cytoscape is first arg to ext

  ext.apply(null, args);
  return this;
};

cytoscape.warnings = function (bool) {
  return index_js.warnings(bool);
}; // replaced by build system


cytoscape.version = version__default["default"]; // expose public apis (mostly for extensions)

cytoscape.stylesheet = cytoscape.Stylesheet = Stylesheet__default["default"];

module.exports = cytoscape;
