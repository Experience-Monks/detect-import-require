var acorn = require('acorn')
var escodegen = require('escodegen')
var defined = require('defined')
var isBuffer = require('is-buffer')
var types = require('ast-types')

var regexRequire = /\brequire\b/
var regexImport = /\bimport\b/
var regexBoth = /\b(import|require)\b/

module.exports = detectImportRequire
function detectImportRequire (src, opts) {
  return findImportRequire(src, opts).strings
}

module.exports.find = findImportRequire
function findImportRequire (src, opts) {
  opts = opts || {}

  // allow Node Buffer
  if (isBuffer(src)) {
    src = src.toString()
  }

  if (typeof src !== 'string' && !src) {
    throw new Error('src option must be a string, Buffer or AST')
  }

  var imports = defined(opts.imports, true)
  var requires = defined(opts.requires, true)

  var results = {
    strings: [],
    expressions: [],
    nodes: []
  }

  var ast
  if (typeof src === 'string') {
    // quick regex test before we parse entire AST
    src = (src || '')
    var regex = regexBoth
    if (imports && !requires) regex = regexImport
    else if (requires && !imports) regex = regexRequire
    if (!regex.test(src)) {
      return results
    }

    // now parse
    ast = acorn.parse(src, {
      ecmaVersion: 6,
      sourceType: 'module',
      allowReserved: true,
      allowReturnOutsideFunction: true,
      allowHashBang: true
    })
  } else {
    // assume ast is given
    ast = src
  }

  var importDeclaration, callExpression
  if (imports) {
    importDeclaration = function (path) {
      var node = path.node
      if (node.source.type === 'Literal') {
        results.strings.push(node.source.value)
      }
      results.nodes.push(node)
      this.traverse(path)
    }
  }

  if (requires) {
    callExpression = function (path) {
      var node = path.node
      if (!isRequire(node)) return false
      if (node.arguments.length) {
        if (node.arguments[0].type === 'Literal') {
          results.strings.push(node.arguments[0].value)
        } else {
          results.expressions.push(escodegen.generate(node.arguments[0]))
        }
      }
      results.nodes.push(node)
      this.traverse(path)
    }
  }

  types.visit(ast, {
    visitImportDeclaration: importDeclaration,
    visitCallExpression: callExpression
  })

  return results
}

function isRequire (node) {
  return node.callee.type === 'Identifier' &&
    node.callee.name === 'require'
}
