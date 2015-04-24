import a from 'assert';
import { assert } from 'rtts_assert/es6/src/rtts_assert';

console.log('- runtime: argument');
a.throws(() => {
  function hello(str: string): number {
    return str.length;
  }
  hello(3);
}, /Invalid arguments given/);

console.log('- runtime: return');
a.throws(() => {
  function hello(str: string): number {
    return str;
  }
  hello('hello');
}, /Expected to return an instance of number, got "hello"/);
