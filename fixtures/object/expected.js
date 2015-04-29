"use strict";

var _assert = require("rtts_assert/es6/src/rtts_assert");

function hello(person) {
  _assert.assert.argumentTypes(person, _assert.assert.structure({
    name: _assert.assert.type.string,
    age: _assert.assert.type.number
  }));
}
