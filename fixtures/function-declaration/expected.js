"use strict";

var _assert = require("rtts_assert/es6/src/rtts_assert");

function doSomething(str, num, bool) {
  _assert.assert.argumentTypes(str, _assert.assert.string, num, _assert.assert.number, bool, _assert.assert.boolean);

  return _assert.assert.returnType(new Foo(), Foo);
}
