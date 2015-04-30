var babel = require('babel-core');
var t = babel.types;
var Transformer = babel.Transformer;

// TODO: Use UID to avoid name collision.
var ASSERT_NAME = 'assert';

module.exports = new Transformer('angular2-type-assertion', {
  Program: {
    enter: function (node, parent, scope, file) {
      new AssertionInjector(this, file).run();
    }
  }
});

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

var functionVisitor = applyAlias({
  Function: {
    enter: function (node, parent, scope, injector) {
      injector.insertArgumentAssertion(node);
      injector.insertReturnAssertion(node, scope);
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
        node.argument || t.identifier('undefined'),
        typeForAnnotation(state.annotation)
      ];
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

function primitive(typeName) {
  return t.memberExpression(
    t.memberExpression(t.identifier(ASSERT_NAME), t.identifier('type')),
    t.identifier(typeName)
  );
}

function genericType(typeId, arg) {
  return t.callExpression(
    t.memberExpression(t.identifier(ASSERT_NAME), t.identifier('genericType')),
    [typeId, arg]
  );
}

function arrayOf(arg) {
  return t.callExpression(
    t.memberExpression(t.identifier(ASSERT_NAME), t.identifier('arrayOf')),
    [arg]
  );
}

function structure(definitionProperties) {
  var properties = definitionProperties.map(function (property) {
    return t.property(
      'init',
      property.key,
      typeForAnnotation(property.value)
    );
  });
  var definition = t.objectExpression(properties);
  return t.callExpression(
    t.memberExpression(t.identifier(ASSERT_NAME), t.identifier('structure')),
    [definition]
  );
}

function typeForAnnotation(annotation) {
  if (!annotation) {
    return primitive('any');
  }
  switch (annotation.type) {
    case 'StringTypeAnnotation':
      return primitive('string');
    case 'NumberTypeAnnotation':
      return primitive('number');
    case 'BooleanTypeAnnotation':
      return primitive('boolean');
    case 'VoidTypeAnnotation':
      return primitive('void');
    case 'GenericTypeAnnotation':
      if (annotation.typeParameters) {
        // FIXME: Ignoring other params.
        var childType = typeForAnnotation(annotation.typeParameters.params[0]);
        if (annotation.id.name === 'Array') {
          return arrayOf(childType);
        } else {
          return genericType(annotation.id, childType);
        }
      } else {
        return annotation.id;
      }
    case 'ObjectTypeAnnotation':
      return structure(annotation.properties);
    case 'FunctionTypeAnnotation':
      return t.identifier('Function');
    // TODO: Union and Intersection.
    // TODO: Any other types?
    default:
      return primitive('any');
  }
}

function AssertionInjector(path, file) {
  this.node = path.node;
  this.parent = path.parent;
  this.scope = path.scope;

  this.path = path;
  this.file = file;

  this.injected = false;
}

AssertionInjector.prototype.run = function () {
  this.scope.traverse(this.node, functionVisitor, this);
  // TODO: `var foo: Foo = bar;` -> `var foo = assert.type(bar, Foo);`

  if (this.injected) {
    this.insertImport();
  }
};

AssertionInjector.prototype.insertImport = function () {
  var specifiers = [t.importSpecifier(t.identifier('assert'), t.identifier(ASSERT_NAME), '')];
  var declaration = t.importDeclaration(specifiers, t.literal('rtts_assert/es6/src/rtts_assert'));
  this.node.body.unshift(declaration);
  this.path.replaceWith(this.node);
  // Because we added the new import declaration, we need to update local imports cache
  // so that assignments will be properly remapped by `file.moduleFormatter.remapAssignments()`.
  this.file.moduleFormatter.getLocalImports();
}

AssertionInjector.prototype.insertArgumentAssertion = function (func) {
  if (func.params.length === 0) {
    return;
  }
  var hasAnnotations = func.params.reduce(function (acc, param) {
    return acc || !!param.typeAnnotation;
  }, false);
  if (!hasAnnotations) {
    return;
  }
  var args = func.params.reduce(function (acc, identifier) {
    var annotation = identifier.typeAnnotation && identifier.typeAnnotation.typeAnnotation;
    var type = typeForAnnotation(annotation);
    // TODO: Remove default value from identifier.
    acc.push(identifier);
    acc.push(type);
    return acc;
  }, []);
  var statement = t.expressionStatement(
    t.callExpression(
      t.memberExpression(t.identifier(ASSERT_NAME), t.identifier('argumentTypes')),
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
  scope.traverse(func, returnVisitor, state);
  if (state.found) {
    this.injected = true;
  } else {
    // TODO: Warn if return doesn't exist in the function.
  }
};
