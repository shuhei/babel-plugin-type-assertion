"use strict";

var _rtts_assertRtts_assert = require("rtts_assert/rtts_assert");

function doSomething(foo) {
  if (foo) {
    return _rtts_assertRtts_assert.assert.returnType(foo, _rtts_assertRtts_assert.assert.type["void"]);
  } else {
    return _rtts_assertRtts_assert.assert.returnType(undefined, _rtts_assertRtts_assert.assert.type["void"]);
  }
}
