"use strict";

var _assert = require("rtts_assert/es6/src/rtts_assert");

function doSomething(foo) {
  if (foo) {
    return _assert.assert.returnType(foo, _assert.assert.type["void"]);
  } else {
    return _assert.assert.returnType(undefined, _assert.assert.type["void"]);
  }
}
