"use strict";

var _rtts_assertRtts_assert = require("rtts_assert/rtts_assert");

function doSomething(str, num, bool) {
  _rtts_assertRtts_assert.assert.argumentTypes(str, _rtts_assertRtts_assert.assert.type.string, num, _rtts_assertRtts_assert.assert.type.number, bool, _rtts_assertRtts_assert.assert.type.boolean);

  return _rtts_assertRtts_assert.assert.returnType(new Foo(), Foo);
}
