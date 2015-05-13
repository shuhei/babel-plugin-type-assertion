"use strict";

var _rtts_assertEs6SrcRtts_assert = require("rtts_assert/es6/src/rtts_assert");

function hello(person) {
  _rtts_assertEs6SrcRtts_assert.assert.argumentTypes(person, _rtts_assertEs6SrcRtts_assert.assert.structure({
    name: _rtts_assertEs6SrcRtts_assert.assert.type.string,
    age: _rtts_assertEs6SrcRtts_assert.assert.type.number
  }));
}
