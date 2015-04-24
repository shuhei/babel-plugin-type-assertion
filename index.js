var babel = require('babel-core');
var t = babel.types;
var Transformer = babel.Transformer;

module.exports = new Transformer('angular2-type-assertion', {
  // TODO: Babel's parser doesn't support return type of arrow function.
  Function: function (node, parent, scope, file) {
    // TODO: Insert "import { assert } from 'rtts_assert/rtts_assert';" outside.
    insertArgumentAssersion(node);
    insertReturnAssertion(node, scope);
  }
});

function argumentTypes(typeName) {
  return t.memberExpression(
    t.memberExpression(t.identifier('assert'), t.identifier('type')),
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
    // TODO: Any other types?
    default:
      return argumentTypes('any');
  }
}

function insertArgumentAssersion(func) {
  if (func.params.length === 0) {
    return;
  }
  var identifiers = func.params;
  var hasAnnotations = func.params.reduce(function (acc, param) {
    return acc || !!param.typeAnnotation;
  }, false);
  if (!hasAnnotations) {
    return;
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
      t.memberExpression(t.identifier('assert'), t.identifier('argumentTypes')),
      args
    )
  );
  func.body.body.unshift(statement);
}

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
          t.memberExpression(t.identifier('assert'), t.identifier('returnType')),
          args
        )
      );
      return statement;
    }
  }
};

function insertReturnAssertion(func, scope) {
  if (!func.returnType) {
    return;
  }
  // Replace all returns in the very function scope.
  var annotation = func.returnType.typeAnnotation;
  scope.traverse(func, returnVisitor, {
    scope: scope,
    annotation: annotation
  });
}
