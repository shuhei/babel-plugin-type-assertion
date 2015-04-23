var assert = require('assert');
var fs = require('fs');
var path = require('path');

var babel = require('babel-core');
var chalk = require('chalk');
var diff = require('diff');

function test(fixtureName) {
  console.log('-', fixtureName);
  var fixture = fs.readFileSync(path.resolve('fixtures', fixtureName, 'fixture.js')).toString();
  var expected = fs.readFileSync(path.resolve('fixtures', fixtureName, 'expected.js')).toString();
  var actual = babel.transform(fixture, {
    plugins: ['./index'],
    externalHelpers: true
  }).code;
  assertLines(actual, expected);
}

function assertLines(actual, expected) {
  var message = diff.diffLines(actual + '\n', expected).map(function (part) {
    return chalk[colorForPart(part)](part.value);
  }).join('');
  assert.equal(actual + '\n', expected, '\n' + message);
}

function colorForPart(part) {
  if (part.added) {
    return 'green';
  } else if (part.removed) {
    return 'red';
  } else {
    return 'grey';
  }
}

test('class-instance-method');
