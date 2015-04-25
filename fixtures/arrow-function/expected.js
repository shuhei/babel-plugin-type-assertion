"use strict";

var assert = require("rtts_assert/es6/src/rtts_assert").assert;

var doSomething = function doSomething(str, num, bool) {
  assert.argumentTypes(str, assert.type.string, num, assert.type.number, bool, assert.type.boolean);

  return new Foo();
};
