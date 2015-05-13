'use strict';

var _rtts_assertEs6SrcRtts_assert = require('rtts_assert/es6/src/rtts_assert');

function doSomething() {
  var str = arguments[0] === undefined ? 'hello' : arguments[0];

  _rtts_assertEs6SrcRtts_assert.assert.argumentTypes(str, _rtts_assertEs6SrcRtts_assert.assert.type.string);

  return _rtts_assertEs6SrcRtts_assert.assert.returnType(str, _rtts_assertEs6SrcRtts_assert.assert.type.string);
}
