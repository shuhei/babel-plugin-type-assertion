require('babel-core/register')({
  ignore: false,
  only: /(\/test\/|rtts_assert)/,
  plugins: ['./index']
});
require('./fixture');
require('./runtime');
