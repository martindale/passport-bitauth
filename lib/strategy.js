/**
 * Module dependencies.
 */
var util = require('util')
  , rawBody = require('raw-body')
  , passport = require('passport-strategy')
  , bitauth = require('bitauth');

/**
 * `Strategy` constructor.
 * 
 * The BitAuth authentication strategy authenticates requests based on the 
 * signature and public key supplied in the headers of individual requests.
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('the BitAuth authentication strategy requires a callback');
  
  passport.Strategy.call(this);
  
  this.name = 'bitauth';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);


/**
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  var self = this;
  options = options || {};
  options.session = options.session || false;

  rawBody( req , function(err, body) {
    if (err) { return self.fail({ message: 'No request body.' }, 400); }
    if (!req.headers || !req.headers['x-pubkey'] || !req.headers['x-signature']) {
      return self.fail({ message: 'Missing credentials' }, 400);
    }

    // Check signature is valid
    // First construct data to check signature on
    var fullUrl = req.protocol + '://' + req.get('host') + req.url;
    var data = fullUrl + body;
    
    bitauth.verifySignature( data , req.headers['x-pubkey'], req.headers['x-signature'], function(err, result) {
      if (err || !result) {
        return self.fail({ message: 'Invalid signature' }, 400);
      }
      
      // Get the SIN from the public key
      var sin = bitauth.getSinFromPublicKey(req.headers['x-pubkey']);
      if (!sin) return res.send(400, {error: 'Bad public key'});

      function verified(err, user, info) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(info); }
        self.success(user, info);
      }
      
      try {
        if (self._passReqToCallback) {
          self._verify(req, sin, verified);
        } else {
          self._verify(sin, verified);
        }
      } catch (ex) {
        return self.error(ex);
      }

    });

  });
};

/**
 * Expose `Strategy`.
 */ 
module.exports = Strategy;
