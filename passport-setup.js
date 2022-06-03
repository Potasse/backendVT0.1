const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('./backend/models/User');

const GOOGLE_CLIENT_ID  = '797071739321-9fnkrljmih6l52gpeakpo1mtmb3jgrmv.apps.googleusercontent.com';  
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback",
    passReqToCallback: true  
  },

  function(request, accessToken, refreshToken, profile, done) {

   
   
    User.findOrCreate({ googleId: profile.id }, function (err, user) {

      return done(err, profile);
        

    });
    // return done(null, profile);

  }
));

passport.serializeUser(function(user, done){

    done(null, user);

});

passport.deserializeUser(function(user, done){

    done(null, user);

});
