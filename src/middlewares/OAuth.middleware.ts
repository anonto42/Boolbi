import passport from "passport";


passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
  })