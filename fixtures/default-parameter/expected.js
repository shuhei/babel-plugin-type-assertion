'use strict';

var _rtts_assertRtts_assert = require('rtts_assert/rtts_assert');

function doSomething() {
  var str = arguments.length <= 0 || arguments[0] === undefined ? 'hello' : arguments[0];

  _rtts_assertRtts_assert.assert.argumentTypes(str, _rtts_assertRtts_assert.assert.type.string);

  return _rtts_assertRtts_assert.assert.returnType(str, _rtts_assertRtts_assert.assert.type.string);
}
