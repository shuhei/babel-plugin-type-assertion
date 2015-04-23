function doSomething(str: string, num: number, bool: boolean): Foo {
  if (!bool) {
    if (str !== num) {
      return new Foo(str);
    }
  }
  var nums = [num].forEach(function (item) {
    return num * 2;
  });
  return new Foo();
}
