var path = require('path')
var foo1 = require('object-assign')
var another = require('object-assign').another
import { foo } from './foo'
import { foo as blah } from './blah'
import * as _ from 'lodash'
import defs from 'defaults'
import 'side-effects'
// import 'commented'
/* import { foo } from 'commented2'; */
// require('commented3')
require(__dirname + '/file.js')
require(path.join(__dirname, '/file.js'))

export default function () {
  var b = require('b')
}
