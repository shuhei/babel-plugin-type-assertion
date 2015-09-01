require('babel-core/register')({
  ignore: false,
  only: /\/test\//,
  plugins: ['./lib/index']
});
require('./fixture');
require('./runtime');
