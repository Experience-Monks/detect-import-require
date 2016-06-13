# detect-import-require

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

This is like [detective](https://www.npmjs.com/package/detective), but with a narrow focus and thin API, specifically aimed at supporting either `import` and/or `require` statements, and not much more.

## Install

```sh
npm install detect-import-require --save
```

## Example

Given the following file:

`source.js`
```js
var foo = require('a').foo
var bar = require('./blah.js')
import { uniq } from 'lodash'
import { resolve } from 'path'
```

```js
var fs = require('fs')
var detect = require('detect-import-require')

var src = fs.readFileSync('source.js', 'utf8')
console.log(detect(src))
//=> [ 'a', './blah.js', 'lodash', 'path' ]
```

See [Custom AST](#custom-ast) for details on parsing additional language syntax, such as JSX or async/await.

## Usage

[![NPM](https://nodei.co/npm/detect-import-require.png)](https://www.npmjs.com/package/detect-import-require)

#### `modules = detect(src, [opt])`

Returns an array of module names (require paths) from the given `src` String, Buffer or AST. By default, looks for `import` and `require` statements. Results are not de-duplicated, and are in the order they are found.

Options:

- `imports` (Boolean) - whether to look for `import` statements, default true
- `requires` (Boolean) - whether to look for `require` statements, default true

#### `modules = detect.find(src, [opt])`

Takes the same options as above, but returns an object with the following additional data:

```js
{
  strings: [],
  expressions: [],
  nodes: []
}
```

Where `strings` is the array of module names, `expressions` is an array of expressions from dynamic `require()` statements, and `nodes` is an array of AST nodes for each found require/import statement.

Expressions do not appear in imports, and look like this:

```js
[
  "path.join(__dirname, '/foo.js')",
  "__dirname + '/file.js'"
]
```

## Custom AST

You can also pass a parsed AST, e.g. if you have a special build of acorn or want full control over parsing options. Here is an example with JSX:

```js
var detect = require('detect-import-require')
var acorn = require('acorn-jsx');
var jsx = [
  "import 'foo';",
  "ReactDOM.render(",
    "<h1>Hello World</h1>,",
    "document.getElementById('root')",
  ");"
].join('\n');

var ast = acorn.parse(jsx, {
  ecmaVersion: 6,
  sourceType: 'module',
  allowReserved: true,
  allowReturnOutsideFunction: true,
  allowHashBang: true,
  plugins: {
    jsx: true
  }
})

detect(ast)
// => [ 'foo' ]
```

## License

MIT, see [LICENSE.md](http://github.com/Jam3/detect-import-require/blob/master/LICENSE.md) for details.
