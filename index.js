var babel = require('babel-core');
var t = babel.types;
var Transformer = babel.Transformer;

// TODO: Use UID to avoid name collision.
var ASSERT_NAME = 'assert';

module.exports = new Transformer('angular2-type-assertion', {
  Program: {
    enter: function (node, parent, scope, file) {
      var state = {
        usedAssertion: false
      };
      scope.traverse(node, functionVisitor, state);
      if (state.usedAssertion) {
        var specifiers = [t.importSpecifier(t.identifier('assert'), t.identifier(ASSERT_NAME), '')];
        var declaration = t.importDeclaration(specifiers, t.literal('rtts_assert/es6/src/rtts_assert'));
        node.body.unshift(declaration);
        this.replaceWith(this.node);
        // Because we added the new import declaration, we need to update local imports cache
        // so that assignments will be properly remapped by `file.moduleFormatter.remapAssignments()`.
        file.moduleFormatter.getLocalImports();
      }
    }
  }
});

function visitFunction(node, parent, scope, state) {
  var foundArgumentAssertion = insertArgumentAssertion(node);
  var foundReturnAssertion = insertReturnAssertion(node, scope);
  if (foundArgumentAssertion || foundReturnAssertion) {
    state.usedAssertion = true;
  }
}

var functionVisitor = {
  // TODO: Babel's parser doesn't support return type of arrow function.
  // TOOD: Can't we use alias keys in oridinary visitors?
  // https://github.com/babel/babel/blob/master/src/babel/types/alias-keys.json
  FunctionExpression: { enter: visitFunction },
  FunctionDeclaration: { enter: visitFunction },
  ArrowFunctionExpression: { enter: visitFunction }
};

var returnVisitor = {
  ReturnStatement: {
    enter: function (node, parent, scope, state) {
      // Ignore inner functions.
      if (scope.getFunctionParent() !== state.scope) {
        return;
      }
      var args = [
        node.argument,
        typeForAnnotation(state.annotation)
      ];
      // TODO: Use uid for assert.
      var statement = t.returnStatement(
        t.callExpression(
          t.memberExpression(t.identifier(ASSERT_NAME), t.identifier('returnType')),
          args
        )
      );
      state.found = true;
      return statement;
    }
  }
};

function argumentTypes(typeName) {
  return t.memberExpression(
    t.memberExpression(t.identifier(ASSERT_NAME), t.identifier('type')),
    t.identifier(typeName)
  );
}

function typeForAnnotation(annotation) {
  if (!annotation) {
    return argumentTypes('any');
  }
  switch (annotation.type) {
    case 'StringTypeAnnotation':
      return argumentTypes('string');
    case 'NumberTypeAnnotation':
      return argumentTypes('number');
    case 'BooleanTypeAnnotation':
      return argumentTypes('boolean');
    case 'GenericTypeAnnotation':
      // TODO: annotation.typeParameters such as List<Foo>
      return annotation.id;
    // TODO: ObjectTypeAnnotation
    // TODO: FunctionTypeAnnotation
    // TOOD: void?
    // TODO: Any other types?
    default:
      return argumentTypes('any');
  }
}

function insertArgumentAssertion(func) {
  if (func.params.length === 0) {
    return false;
  }
  var identifiers = func.params;
  var hasAnnotations = func.params.reduce(function (acc, param) {
    return acc || !!param.typeAnnotation;
  }, false);
  if (!hasAnnotations) {
    return false;
  }
  var types = func.params.map(function(param) {
    var annotation = param.typeAnnotation && param.typeAnnotation.typeAnnotation;
    return typeForAnnotation(annotation);
  });
  var args = identifiers.reduce(function (acc, identifier, i) {
    // Remove default value from identifier.
    acc.push(identifier);
    acc.push(types[i]);
    return acc;
  }, new Array(identifiers.length * 2));
  // TODO: Use uid for assert.
  var statement = t.expressionStatement(
    t.callExpression(
      t.memberExpression(t.identifier(ASSERT_NAME), t.identifier('argumentTypes')),
      args
    )
  );
  func.body.body.unshift(statement);
  return true;
}

function insertReturnAssertion(func, scope) {
  if (!func.returnType) {
    return false;
  }
  // Replace all returns in the very function scope.
  var annotation = func.returnType.typeAnnotation;
  var state = {
    scope: scope,
    annotation: annotation,
    found: false
  };
  scope.traverse(func, returnVisitor, state);
  // TODO: Warn if return doesn't exist in the function.
  return state.found;
}
