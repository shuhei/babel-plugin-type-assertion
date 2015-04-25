var babel = require('babel-core');
var t = babel.types;
var Transformer = babel.Transformer;

var ASSERT_NAME = 'assert';

module.exports = new Transformer('angular2-type-assertion', {
  // TODO: Babel's parser doesn't support return type of arrow function.
  Function: function (node, parent, scope, file) {
    var foundArgumentAssertion = insertArgumentAssertion(node);
    var foundReturnAssertion = insertReturnAssertion(node, scope);
    if (foundArgumentAssertion || foundReturnAssertion) {
      file._usedAssertion = true;
    }
  },
  Program: {
    exit: function (node, parent, scope, file) {
      if (file._usedAssertion) {
        // FIXME: `import declaration doesn't get transpiled. Is it because of exit?
        // var specifiers = [t.importSpecifier(t.identifier(ASSERT_NAME), t.identifier('assert'))];
        // var declaration = t.importDeclaration(specifiers, t.literal('rtts_assert/es6/src/rtts_assert'));
        var call = t.callExpression(t.identifier('require'), [t.literal('rtts_assert/es6/src/rtts_assert')]);
        var member = t.memberExpression(call, t.identifier('assert'));
        var declaration = t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier(ASSERT_NAME), member)
        ]);
        node.body.unshift(declaration);
      }
    }
  }
});

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
