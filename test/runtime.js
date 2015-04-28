import a from 'assert';

console.log('- runtime: argument');
a.throws(() => {
  function hello(str: string): number {
    return str.length;
  }
  hello(3);
}, /Invalid arguments given/);

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

console.log('- runtime: array argument');
a.throws(() => {
  function hello(nums: Array<number>): Array<string> {
    return nums.map((num) => num.toString());
  }
  hello(['1', '2', '3']);
}, /Invalid arguments given/);

console.log('- runtime: array return');
a.throws(() => {
  function hello(nums: Array<number>): Array<number> {
    return nums.map((num) => num.toString());
  }
  hello([1, 2, 3]);
}, /Expected to return an instance of array of number, got \["1", "2", "3"\]/);
