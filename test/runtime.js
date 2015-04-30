import a from 'assert';

console.log('- runtime: argument');
a.throws(() => {
  function hello(str: string): number {
    return str.length;
  }
  hello(3);
}, /Invalid arguments given[\s\S]*1st argument has to be an instance of string, got 3/);

console.log('- runtime: last return');
a.throws(() => {
  function hello(str: string): number {
    return str;
  }
  hello('hello');
}, /Expected to return an instance of number, got "hello"/);

console.log('- runtime: early return');
a.throws(() => {
  function hello(str: string): number {
    if (str.length === 0) {
      return 'wow';
    }
    return str.length;
  }
  hello('');
}, /Expected to return an instance of number, got "wow"/);

console.log('- runtime: return void error');
a.throws(() => {
  function hello(str: string): void {
    return str;
  }
  hello('hello');
}, /Expected to return an instance of void, got "hello"/);

console.log('- runtime: return void');
a.doesNotThrow(() => {
  function hello(str: string): void {
    return;
  }
  hello('hello');
});

console.log('- runtime: array argument');
a.throws(() => {
  function hello(nums: Array<number>) {
  }
  hello(['1', '2', '3']);
}, /Invalid arguments given[\s\S]*1st argument has to be an instance of array of number/);

console.log('- runtime: array return');
a.throws(() => {
  function hello(nums): Array<number> {
    return nums.map((num) => num.toString());
  }
  hello([1, 2, 3]);
}, /Expected to return an instance of array of number, got \["1", "2", "3"\]/);

console.log('- runtime: object');
a.throws(() => {
  function hello(person: { name: string; age: number }) {
  }
  hello({ name: 'shuhei', age: true });
}, /Invalid arguments given[\s\S]*true is not instance of number/);

console.log('- runtime: function');
a.throws(() => {
  function hello(func: (num: number) => string) {
    return func(123);
  }
  hello(123);
}, /Invalid arguments given[\s\S]*1st argument has to be an instance of Function, got 123/);
