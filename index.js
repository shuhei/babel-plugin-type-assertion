'use strict';

var createHelper = require('babel-rtts-helper');

module.exports = function (babel) {
  var t = babel.types;
  var Transformer = babel.Transformer;

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
        enter: function (node, parent, scope, injector) {
          injector.insertArgumentAssertion(node);
          injector.insertReturnAssertion(node, scope);
        }
      }
    });
  }

  function createReturnVisitor(assertId, helper) {
    return {
      ReturnStatement: {
        enter: function (node, parent, scope, state) {
          // Ignore inner functions.
          if (scope.getFunctionParent() !== state.scope) {
            return undefined;
          }
          var args = [
            node.argument || t.identifier('undefined'),
            helper.typeForAnnotation(state.annotation)
          ];
          var statement = t.returnStatement(
            t.callExpression(
              t.memberExpression(assertId, t.identifier('returnType')),
              args
            )
          );
          state.found = true;
          return statement;
        }
      }
    };
  }

  function AssertionInjector(path, file) {
    this.node = path.node;
    this.parent = path.parent;
    this.scope = path.scope;

    this.path = path;
    this.file = file;

    this.injected = false;
    this.assertName = 'assert';
    this.assertId = t.identifier(this.assertName);
    this.helper = createHelper(babel, this.assertName);
  }

  AssertionInjector.prototype.run = function () {
    this.scope.traverse(this.node, createFunctionVisitor(), this);
    // TODO: `var foo: Foo = bar;` -> `var foo = assert.type(bar, Foo);`

    if (this.injected) {
      this.insertImport();
    }
  };

  // TODO: Use babel's File.prototype.addImport when it supports named specifiers.
  // https://github.com/babel/babel/issues/1436
  AssertionInjector.prototype.insertImport = function () {
    var id = this.file.dynamicImportIds[this.assertName];
    if (!id) {
      id = this.file.dynamicImportIds[this.assertName] = this.assertId;
      var specifiers = [t.importSpecifier(t.identifier('assert'), this.assertId, '')];
      var declaration = t.importDeclaration(specifiers, t.literal('rtts_assert/es6/src/rtts_assert'));
      /* eslint-disable no-underscore-dangle */
      declaration._blockHoist = 3;
      /* eslint-enable no-underscore-dangle */

      this.file.moduleFormatter.importSpecifier(specifiers[0], declaration, this.file.dynamicImports, this.file.scope);
      this.file.moduleFormatter.hasLocalImports = true;
    }
    return id;
  };

  AssertionInjector.prototype.insertArgumentAssertion = function (func) {
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
      var type = this.helper.typeForAnnotation(annotation);
      acc.push(identifier);
      acc.push(type);
      return acc;
    }.bind(this), []);
    var statement = t.expressionStatement(
      t.callExpression(
        t.memberExpression(this.assertId, t.identifier('argumentTypes')),
        args
      )
    );
    func.body.body.unshift(statement);
    this.injected = true;
  };

  // TODO: Babel's parser doesn't support return type of arrow function.
  AssertionInjector.prototype.insertReturnAssertion = function (func, scope) {
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
  };

  return new Transformer('type-assertion', {
    Program: {
      enter: function (node, parent, scope, file) {
        new AssertionInjector(this, file).run();
      }
    }
  });
};
