"use strict";

var _rtts_assertRtts_assert = require("rtts_assert/rtts_assert");

function hello(person) {
  _rtts_assertRtts_assert.assert.argumentTypes(person, _rtts_assertRtts_assert.assert.structure({
    name: _rtts_assertRtts_assert.assert.type.string,
    age: _rtts_assertRtts_assert.assert.type.number
  }));
}
