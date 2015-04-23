"use strict";

var doSomething = function doSomething(str, num, bool) {
  assert.argumentTypes(str, assert.type.string, num, assert.type.number, bool, assert.type.boolean);

  return new Foo();
};
