var acorn = require('acorn')
var walk = require('acorn/dist/walk')
var escodegen = require('escodegen')
var defined = require('defined')

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
  src = (src || '').toString()

  var imports = defined(opts.imports, true)
  var requires = defined(opts.requires, true)

  var results = {
    strings: [],
    expressions: [],
    nodes: []
  }

  // quick regex test before we parse entire AST
  var regex = regexBoth
  if (imports && !requires) regex = regexImport
  else if (requires && !imports) regex = regexRequire
  if (!regex.test(src)) {
    return results
  }

  var ast = acorn.parse(src, {
    ecmaVersion: 6,
    sourceType: 'module',
    allowReserved: true,
    allowReturnOutsideFunction: true,
    allowHashBang: true
  })

  var importDeclaration, callExpression
  if (imports) {
    importDeclaration = function (node) {
      if (node.source.type === 'Literal') {
        results.strings.push(node.source.value)
      }
      results.nodes.push(node)
    }
  }

  if (requires) {
    callExpression = function (node) {
      if (!isRequire(node)) return
      if (node.arguments.length) {
        if (node.arguments[0].type === 'Literal') {
          results.strings.push(node.arguments[0].value)
        } else {
          results.expressions.push(escodegen.generate(node.arguments[0]))
        }
      }
      results.nodes.push(node)
    }
  }

  walk.simple(ast, {
    ImportDeclaration: importDeclaration,
    CallExpression: callExpression
  })

  return results
}

function isRequire (node) {
  return node.callee.type === 'Identifier' &&
    node.callee.name === 'require'
}
