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

import * as is from './is.js';
import Core from './core/index.js';
import extension from './extension.js';
import Stylesheet from './stylesheet.js';
import version from './version.js';
import { warnings } from './util/index.js';

var cytoscape = function cytoscape(options) {
  // if no options specified, use default
  if (options === undefined) {
    options = {};
  } // create instance


  if (is.plainObject(options)) {
    return new Core(options);
  } // allow for registration of extensions
  else if (is.string(options)) {
    return extension.apply(extension, arguments);
  }
}; // e.g. cytoscape.use( require('cytoscape-foo'), bar )


cytoscape.use = function (ext) {
  var args = Array.prototype.slice.call(arguments, 1); // args to pass to ext

  args.unshift(cytoscape); // cytoscape is first arg to ext

  ext.apply(null, args);
  return this;
};

cytoscape.warnings = function (bool) {
  return warnings(bool);
}; // replaced by build system


cytoscape.version = version; // expose public apis (mostly for extensions)

cytoscape.stylesheet = cytoscape.Stylesheet = Stylesheet;

export { cytoscape as default };
