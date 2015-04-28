"use strict";

var _assert = require("rtts_assert/es6/src/rtts_assert");

function doSomething(str, num, bool) {
  _assert.assert.argumentTypes(str, _assert.assert.type.string, num, _assert.assert.type.number, bool, _assert.assert.type.boolean);

  return _assert.assert.returnType(new Foo(), Foo);
}
