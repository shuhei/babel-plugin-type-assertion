"use strict";

var _rtts_assertEs6SrcRtts_assert = require("rtts_assert/es6/src/rtts_assert");

function doSomething(foos, strs) {
  _rtts_assertEs6SrcRtts_assert.assert.argumentTypes(foos, _rtts_assertEs6SrcRtts_assert.assert.arrayOf(Foo), strs, _rtts_assertEs6SrcRtts_assert.assert.genericType(List, _rtts_assertEs6SrcRtts_assert.assert.type.string));

  return _rtts_assertEs6SrcRtts_assert.assert.returnType([1, 2, 3], _rtts_assertEs6SrcRtts_assert.assert.arrayOf(_rtts_assertEs6SrcRtts_assert.assert.type.number));
}
