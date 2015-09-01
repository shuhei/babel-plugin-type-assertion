"use strict";

var _rtts_assertRtts_assert = require("rtts_assert/rtts_assert");

function doSomething(foos, strs) {
  _rtts_assertRtts_assert.assert.argumentTypes(foos, _rtts_assertRtts_assert.assert.arrayOf(Foo), strs, _rtts_assertRtts_assert.assert.genericType(List, _rtts_assertRtts_assert.assert.type.string));

  return _rtts_assertRtts_assert.assert.returnType([1, 2, 3], _rtts_assertRtts_assert.assert.arrayOf(_rtts_assertRtts_assert.assert.type.number));
}
