const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/users');

passport.use(new LocalStrategy({
    usernameField:'email'
},

    async function (email,password,done) {
        try {
            const user = await User.findOne({email:email});

            if(!user || user.password!=password){
                return done(null,false);
            }
            return done(null, user);

            
        } catch (err) {
            return done(err);
            
        }
        
    
}));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});


passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        return done(null, user);
    } catch (err) {
        console.log("Error in finding user by ID", err);
        return done(err);
    }
});



passport.checkAuthentication = function(req, res,next){
    if(req.isAuthenticated()){
        return next();

    }
    // if the user is not signed int 
    return res.redirect('/users/sign-in');
}

passport.setAuthenticatedUser = function(req,res,next){
    if(req.isAuthenticated()){
        // req.user contains the current sign in user from thr cookie and we are just sending this to the locals for view
        res.locals.user=req.user;
    }
    next();
}

module.exports = passport;
