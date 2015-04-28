"use strict";

var _assert = require("rtts_assert/es6/src/rtts_assert");

function doSomething(foos, strs) {
  _assert.assert.argumentTypes(foos, _assert.assert.arrayOf(Foo), strs, _assert.assert.genericType(List, _assert.assert.type.string));

  return _assert.assert.returnType([1, 2, 3], _assert.assert.arrayOf(_assert.assert.type.number));
}
