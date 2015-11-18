var detect = require('../')
var test = require('tape')
var fs = require('fs')
var path = require('path')

var filename = path.resolve(__dirname, 'fixtures', 'module.js')
var src = fs.readFileSync(filename, 'utf8')

test('like the detective module, but for CommonJS + imports', function (t) {
  t.deepEqual(detect(src), [
    'path', 'object-assign', 'object-assign',
    './foo', './blah', 'lodash', 'defaults',
    'side-effects', 'b'
  ])

  t.deepEqual(detect(src, { imports: false }), [
    'path', 'object-assign', 'object-assign', 'b'
  ])

  t.deepEqual(detect(src, { imports: false, requires: false }), [])

  t.deepEqual(detect(src, { imports: true, requires: false }), [
    './foo', './blah', 'lodash', 'defaults', 'side-effects'
  ])
  t.end()
})

test('advanced mode', function (t) {
  t.deepEqual(detect.find(src).expressions, [
    "__dirname + '/file.js'",
    "path.join(__dirname, '/file.js')"
  ])

  t.deepEqual(detect.find(src).strings, [
    'path', 'object-assign', 'object-assign',
    './foo', './blah', 'lodash', 'defaults',
    'side-effects', 'b'
  ])

  t.deepEqual(detect.find(src, { requires: false }).expressions, [])
  t.end()
})
