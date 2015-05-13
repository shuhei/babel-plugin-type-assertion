"use strict";

var _rtts_assertEs6SrcRtts_assert = require("rtts_assert/es6/src/rtts_assert");

function doSomething(foo) {
  if (foo) {
    return _rtts_assertEs6SrcRtts_assert.assert.returnType(foo, _rtts_assertEs6SrcRtts_assert.assert.type["void"]);
  } else {
    return _rtts_assertEs6SrcRtts_assert.assert.returnType(undefined, _rtts_assertEs6SrcRtts_assert.assert.type["void"]);
  }
}
