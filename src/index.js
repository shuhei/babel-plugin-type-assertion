import rttsHelper from 'babel-rtts-helper';

export default function ({ Plugin, types: t }) {
  const helper = rttsHelper({ types: t }, 'assert');

  // Make alias keys available in oridinary visitors.
  // https://github.com/babel/babel/blob/master/src/babel/types/alias-keys.json
  function applyAlias(visitor) {
    return Object.keys(visitor).reduce((acc, key) => {
      const aliases = t.FLIPPED_ALIAS_KEYS[key];
      if (aliases) {
        aliases.forEach((alias) => {
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
        enter(node, parent, scope, injector) {
          injector.insertArgumentAssertion(node);
          injector.insertReturnAssertion(node, scope);
        }
      }
    });
  }

  function createReturnVisitor(assertId, helper) {
    return {
      ReturnStatement: {
        enter(node, parent, scope, state) {
          // Ignore inner functions.
          if (scope.getFunctionParent() !== state.scope) {
            return undefined;
          }
          const args = [
            node.argument || t.identifier('undefined'),
            helper.typeForAnnotation(state.annotation)
          ];
          const statement = t.returnStatement(
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

  class AssertionInjector {
    constructor(path, file, helper) {
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

    run() {
      this.scope.traverse(this.node, createFunctionVisitor(), this);
      // TODO: `var foo: Foo = bar;` -> `var foo = assert.type(bar, Foo);`

      if (this.injected) {
        this.insertImport();
      }
    }

    // TODO: Use babel's File.prototype.addImport when it supports named specifiers.
    // https://github.com/babel/babel/issues/1436
    insertImport() {
      let id = this.file.dynamicImportIds[this.assertName];
      if (!id) {
        id = this.file.dynamicImportIds[this.assertName] = this.assertId;
        const specifiers = [t.importSpecifier(t.identifier('assert'), this.assertId, '')];
        const declaration = t.importDeclaration(specifiers, t.literal('rtts_assert/rtts_assert'));
        /* eslint-disable no-underscore-dangle */
        declaration._blockHoist = 3;
        /* eslint-enable no-underscore-dangle */

        this.file.moduleFormatter.importSpecifier(specifiers[0], declaration, this.file.dynamicImports, this.file.scope);
        this.file.moduleFormatter.hasLocalImports = true;
      }
      return id;
    }

    insertArgumentAssertion(func) {
      if (func.params.length === 0) {
        return;
      }
      const hasAnnotations = func.params.reduce((acc, param) => {
        let identifier = param;
        if (param.type === 'AssignmentPattern') {
          // Default parameter.
          identifier = param.left;
        }
        return acc || !!identifier.typeAnnotation;
      }, false);
      if (!hasAnnotations) {
        return;
      }
      const args = func.params.reduce((acc, param) => {
        let identifier = param;
        if (param.type === 'AssignmentPattern') {
          // Default parameter.
          identifier = param.left;
        }
        const annotation = identifier.typeAnnotation && identifier.typeAnnotation.typeAnnotation;
        const type = this.helper.typeForAnnotation(annotation);
        acc.push(identifier);
        acc.push(type);
        return acc;
      }, []);
      const statement = t.expressionStatement(
        t.callExpression(
          t.memberExpression(this.assertId, t.identifier('argumentTypes')),
          args
        )
      );
      func.body.body.unshift(statement);
      this.injected = true;
    }

    // TODO: Babel's parser doesn't support return type of arrow function.
    insertReturnAssertion(func, scope) {
      if (!func.returnType) {
        return;
      }
      // Replace all returns in the very function scope.
      const annotation = func.returnType.typeAnnotation;
      const state = {
        scope,
        annotation,
        found: false
      };
      scope.traverse(func, createReturnVisitor(this.assertId, this.helper), state);
      if (state.found) {
        this.injected = true;
      } else {
        // TODO: Warn if return doesn't exist in the function.
      }
    }
  }

  return new Plugin('type-assertion', {
    visitor: {
      Program(node, parent, scope, file) {
        new AssertionInjector(this, file, helper).run();
      }
    }
  });
}
