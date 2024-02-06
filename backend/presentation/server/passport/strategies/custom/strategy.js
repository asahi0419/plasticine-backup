import { createRequire } from "module";
const Require = createRequire(import.meta.url)

var OAuth2Strategy = Require('passport-oauth2')
  , util = Require('util')

function Strategy(options, verify) {
  OAuth2Strategy.call(this, options, verify);
  this.name = 'custom';
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.authorizationParams = function(options) {
  var params = {};

  if (options.prompt) {
    params['prompt'] = options.prompt;
  }

  if (options.loginHint) {
    params['login_hint'] = options.loginHint;
  }

  return params;
}

export default Strategy;
