'use strict';

var _assert = require('rtts_assert/es6/src/rtts_assert');

function doSomething() {
  var str = arguments[0] === undefined ? 'hello' : arguments[0];

  _assert.assert.argumentTypes(str, _assert.assert.type.string);

  return _assert.assert.returnType(str, _assert.assert.type.string);
}
