import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { transform } from 'babel-core';
import chalk from 'chalk';
import diff from 'diff';

function test(fixtureName) {
  console.log('- fixture:', fixtureName);
  const fixture = fs.readFileSync(path.resolve('fixtures', fixtureName, 'fixture.js')).toString();
  const expected = fs.readFileSync(path.resolve('fixtures', fixtureName, 'expected.js')).toString();
  const actual = transform(fixture, {
    plugins: ['./lib/index'],
    externalHelpers: true
  }).code + '\n';
  assertLines(actual, expected);
}

function assertLines(actual, expected) {
  const message = diff.diffLines(actual, expected).map((part) => {
    return chalk[colorForPart(part)](part.value);
  }).join('');
  assert.equal(actual, expected, '\n' + message);
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

fs.readdirSync('fixtures').forEach(test);
