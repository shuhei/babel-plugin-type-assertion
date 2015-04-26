"use strict";

var _assert = require("rtts_assert/es6/src/rtts_assert");

var Foo = (function () {
  function Foo() {
    babelHelpers.classCallCheck(this, Foo);
  }

  babelHelpers.createClass(Foo, null, [{
    key: "doSomething",
    value: function doSomething(str, num, bool) {
      _assert.assert.argumentTypes(str, _assert.assert.string, num, _assert.assert.number, bool, _assert.assert.boolean);

      return _assert.assert.returnType(new Foo(), Foo);
    }
  }]);
  return Foo;
})();
