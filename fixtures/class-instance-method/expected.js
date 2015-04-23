"use strict";

var Foo = (function () {
  function Foo() {
    babelHelpers.classCallCheck(this, Foo);
  }

  babelHelpers.createClass(Foo, [{
    key: "doSomething",
    value: function doSomething(str, num, bool) {
      assert.argumentTypes(str, assert.type.string, num, assert.type.number, bool, assert.type.boolean);
      return assert.returnTypes(new Foo(), Foo);
    }
  }]);
  return Foo;
})();
