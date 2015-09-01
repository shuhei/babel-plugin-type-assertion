"use strict";

var _rtts_assertRtts_assert = require("rtts_assert/rtts_assert");

var Foo = (function () {
  function Foo() {
    babelHelpers.classCallCheck(this, Foo);
  }

  babelHelpers.createClass(Foo, null, [{
    key: "doSomething",
    value: function doSomething(str, num, bool) {
      _rtts_assertRtts_assert.assert.argumentTypes(str, _rtts_assertRtts_assert.assert.type.string, num, _rtts_assertRtts_assert.assert.type.number, bool, _rtts_assertRtts_assert.assert.type.boolean);

      return _rtts_assertRtts_assert.assert.returnType(new Foo(), Foo);
    }
  }]);
  return Foo;
})();
