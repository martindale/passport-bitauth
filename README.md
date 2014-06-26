passport-bitauth
================

BitAuth authentication strategy for PassportJS.

**Please note!**  This _authenticates_ the request, it does **not** _authorize_ it.  You should think about how your application's permission structure is organized; there is a different between a user and _a user who is permitted to perform an action_.

# Use

```javascript
// assuming you have an express application...
// if not: `var app = require('express')();`

// include the auth strategy
var BitAuthStrategy = require('../lib').Strategy;

// an example datastore
// in production, this is likely a real database
var users = {
  'Tf7UNQnxB8SccfoyZScQmb34V2GdEtQkzDz': {
    name: 'Alice',
    sin: 'Tf7UNQnxB8SccfoyZScQmb34V2GdEtQkzDz'
  },
  'Tf22EUFxHWh4wmA3sDuw151W5C5g32jgph2': {
    name: 'Bob',
    sin: 'Tf22EUFxHWh4wmA3sDuw151W5C5g32jgph2'
  }
}

passport.use(new BitAuthStrategy(
  function(sin, done) {
    if (!users[ sin ]) { return done( null , false ); }
    return done( null , users[ sin ] );
  }
));

app.use( passport.initialize() );

app.get( '/authenticated-endpoint', passport.authenticate('bitauth'), function(req, res, next) {
  res.send('this request has been authenticated!');            
});
```
