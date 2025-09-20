
const User = require('../model/users');
const Todo = require('../model/task');
const passport=require('passport');


module.exports.SignUp = function(req,res) {
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    return res.render('user_sign-up',{
        title:'Sign Up'
    });
}
module.exports.signIn = function(req,res){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    return res.render('user_sign_in',{
        title: "Sign in",
        style:'<link rel="stylesheet" href="/css/sign_in_form.css">'
    });
}

module.exports.create = async function (req,res) {
    try {
        if(req.body.password!=req.body.confirm_password){
            return res.redirect('/');
        }
        let user = await User.findOne({email:req.body.email});
        if(!user){
            await User.create(req.body);
            return res.redirect('/users/sign-in');
        }else{
            return res.redirect('/');
        }
        
    } catch (err) {
        console.log('Eror in creating user');
        return res.redirect('/');
    }
    
}



module.exports.createSession = [
  passport.authenticate('local', { failureRedirect: '/users/sign-in' }),
  function(req, res) {
    return res.redirect('/');
  }
];





module.exports.destroySession = function(req,res){
    req.logout(function(err){
        if (err) {
            console.log("Logout error:", err);
            return next(err); // pass to Express error handler
        }
        
        return res.redirect('/');
    });
}



