"use strict";

function doSomething(str, num, bool) {
  assert.argumentTypes(str, assert.type.string, num, assert.type.number, bool, assert.type.boolean);

  if (!bool) {
    if (str !== num) {
      return assert.returnTypes(new Foo(str), Foo);
    }
  }
  var nums = [num].forEach(function (item) {
    return num * 2;
  });
  return assert.returnTypes(new Foo(), Foo);
}
