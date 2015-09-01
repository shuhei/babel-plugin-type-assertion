'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _babelRttsHelper = require('babel-rtts-helper');

var _babelRttsHelper2 = _interopRequireDefault(_babelRttsHelper);

exports['default'] = function (_ref) {
  var Plugin = _ref.Plugin;
  var t = _ref.types;

  var helper = (0, _babelRttsHelper2['default'])({ types: t }, 'assert');

  // Make alias keys available in oridinary visitors.
  // https://github.com/babel/babel/blob/master/src/babel/types/alias-keys.json
  function applyAlias(visitor) {
    return Object.keys(visitor).reduce(function (acc, key) {
      var aliases = t.FLIPPED_ALIAS_KEYS[key];
      if (aliases) {
        aliases.forEach(function (alias) {
          acc[alias] = visitor[key];
        });
      } else {
        acc[key] = visitor[key];
      }
      return acc;
    }, {});
  }

  function createFunctionVisitor() {
    return applyAlias({
      Function: {
        enter: function enter(node, parent, scope, injector) {
          injector.insertArgumentAssertion(node);
          injector.insertReturnAssertion(node, scope);
        }
      }
    });
  }

  function createReturnVisitor(assertId, helper) {
    return {
      ReturnStatement: {
        enter: function enter(node, parent, scope, state) {
          // Ignore inner functions.
          if (scope.getFunctionParent() !== state.scope) {
            return undefined;
          }
          var args = [node.argument || t.identifier('undefined'), helper.typeForAnnotation(state.annotation)];
          var statement = t.returnStatement(t.callExpression(t.memberExpression(assertId, t.identifier('returnType')), args));
          state.found = true;
          return statement;
        }
      }
    };
  }

  var AssertionInjector = (function () {
    function AssertionInjector(path, file, helper) {
      _classCallCheck(this, AssertionInjector);

      this.node = path.node;
      this.parent = path.parent;
      this.scope = path.scope;

      this.path = path;
      this.file = file;

      this.injected = false;
      this.assertName = 'assert';
      this.assertId = t.identifier(this.assertName);

      this.helper = helper;
    }

    _createClass(AssertionInjector, [{
      key: 'run',
      value: function run() {
        this.scope.traverse(this.node, createFunctionVisitor(), this);
        // TODO: `var foo: Foo = bar;` -> `var foo = assert.type(bar, Foo);`

        if (this.injected) {
          this.insertImport();
        }
      }

      // TODO: Use babel's File.prototype.addImport when it supports named specifiers.
      // https://github.com/babel/babel/issues/1436
    }, {
      key: 'insertImport',
      value: function insertImport() {
        var id = this.file.dynamicImportIds[this.assertName];
        if (!id) {
          id = this.file.dynamicImportIds[this.assertName] = this.assertId;
          var specifiers = [t.importSpecifier(t.identifier('assert'), this.assertId, '')];
          var declaration = t.importDeclaration(specifiers, t.literal('rtts_assert/rtts_assert'));
          /* eslint-disable no-underscore-dangle */
          declaration._blockHoist = 3;
          /* eslint-enable no-underscore-dangle */

          this.file.moduleFormatter.importSpecifier(specifiers[0], declaration, this.file.dynamicImports, this.file.scope);
          this.file.moduleFormatter.hasLocalImports = true;
        }
        return id;
      }
    }, {
      key: 'insertArgumentAssertion',
      value: function insertArgumentAssertion(func) {
        var _this = this;

        if (func.params.length === 0) {
          return;
        }
        var hasAnnotations = func.params.reduce(function (acc, param) {
          var identifier = param;
          if (param.type === 'AssignmentPattern') {
            // Default parameter.
            identifier = param.left;
          }
          return acc || !!identifier.typeAnnotation;
        }, false);
        if (!hasAnnotations) {
          return;
        }
        var args = func.params.reduce(function (acc, param) {
          var identifier = param;
          if (param.type === 'AssignmentPattern') {
            // Default parameter.
            identifier = param.left;
          }
          var annotation = identifier.typeAnnotation && identifier.typeAnnotation.typeAnnotation;
          var type = _this.helper.typeForAnnotation(annotation);
          acc.push(identifier);
          acc.push(type);
          return acc;
        }, []);
        var statement = t.expressionStatement(t.callExpression(t.memberExpression(this.assertId, t.identifier('argumentTypes')), args));
        func.body.body.unshift(statement);
        this.injected = true;
      }

      // TODO: Babel's parser doesn't support return type of arrow function.
    }, {
      key: 'insertReturnAssertion',
      value: function insertReturnAssertion(func, scope) {
        if (!func.returnType) {
          return;
        }
        // Replace all returns in the very function scope.
        var annotation = func.returnType.typeAnnotation;
        var state = {
          scope: scope,
          annotation: annotation,
          found: false
        };
        scope.traverse(func, createReturnVisitor(this.assertId, this.helper), state);
        if (state.found) {
          this.injected = true;
        } else {
          // TODO: Warn if return doesn't exist in the function.
        }
      }
    }]);

    return AssertionInjector;
  })();

  return new Plugin('type-assertion', {
    visitor: {
      Program: function Program(node, parent, scope, file) {
        new AssertionInjector(this, file, helper).run();
      }
    }
  });
};

module.exports = exports['default'];