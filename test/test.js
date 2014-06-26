var express = require('express');
var passport = require('passport');
var BitAuthStrategy = require('../lib').Strategy;

var users = {
    'Tf7UNQnxB8SccfoyZScQmb34V2GdEtQkzDz': {
      name: 'Alice',
      sin: 'Tf7UNQnxB8SccfoyZScQmb34V2GdEtQkzDz'
    }
  /*/, 'Tf22EUFxHWh4wmA3sDuw151W5C5g32jgph2': {
    name: 'Bob',
    sin: 'Tf22EUFxHWh4wmA3sDuw151W5C5g32jgph2'
  }/**/
};

passport.serializeUser(function( user , done ) {
  done( null , user.sin );
});

passport.deserializeUser(function( sin , done ) {
  done( null , users[ sin ] );
});

passport.use(new BitAuthStrategy(
  function(sin, done) {
    console.log( 'strat return ' , sin );
    
    if (!users[ sin ]) { return done( null , false ); }
    return done( null , users[ sin ] );
  }
));

var app = express();

app.use( passport.initialize() );
app.get('/user', passport.authenticate('bitauth'), function(req, res) {
  if(!req.sin || !users[req.sin]) return res.send(401, {error: 'Unauthorized'});
  res.send(200, users[req.sin]);
});

app.post('/pizzas', function(req, res) {
  if(!req.sin || !users[req.sin]) return res.send(401, {error: 'Unauthorized'});
  var pizza = req.body;
  pizza.owner = users[req.sin].name;
  pizzas.push(pizza);
  res.send(200, req.body);
});

app.get('/pizzas', function(req, res) {
  res.send(200, pizzas);
});

app.listen(3000);
