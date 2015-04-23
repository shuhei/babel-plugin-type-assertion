"use strict";

function doSomething(str, num, bool) {
  assert.argumentTypes(str, assert.type.string, num, assert.type.number, bool, assert.type.boolean);
  return assert.returnTypes(new Foo(), Foo);
}
