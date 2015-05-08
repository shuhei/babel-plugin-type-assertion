# babel-plugin-type-assertion

An babel transformer plugin for [rtts_assert](https://www.npmjs.com/package/rtts_assert), a run-time type assertion library for JavaScript.

- Inject runtime type assertions based on flow types.
- Can be turned off on production build. (Just exclude from babel's `plugins` option.)

## Installation

```
npm install -S rtts_assert babel-core babel-plugin-type-assertion
```

## Usage

You need to transpile also rtts_assert's ES6 code.

Require hook:

```
require('babel-core/register')({
  ignore: /node_modules\/(?!rtts_assert)/,
  plugins: ['type-assertion']
});

require('your-module');
```

Webpack:

[Working example config file](https://github.com/shuhei/accbook/blob/master/webpack.config.js)
