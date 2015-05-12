let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let User = require('../user')

module.exports = (app) => {
  let passport = app.passport

  passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email',
    failureFlash: true
  }, nodeifyit(async (email, password) => {
    let user = await User.promise.findOne({email})

    if (!user || email !== user.email) {
      return [false, {message: 'Invalid username'}]
    }

    if (!await user.validatePassword(password)) {
      return [false, {message: 'Invalid password'}]
    }
    return user
  }, {spread: true})))

  passport.serializeUser(nodeifyit(async (user) => user._id))
  passport.deserializeUser(nodeifyit(async (id) => {
    return await User.promise.findById(id)
  }))

  passport.use('local-signup', new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email',
    passReqToCallback: true,
    failureFlash: true
  }, nodeifyit(async (req, email, password) => {
      if(!req.body.u_name)
        return [false, {message: 'user name is required'}];
      let user_name = req.body.u_name;
      let blog_name =  req.body.b_name || '';
      let blog_desc =  req.body.b_desc || '';
      email = (email || '').toLowerCase()
      // Is the email taken?
      if (await User.promise.findOne({'email' : email})) {
        return [false, {message: 'That email is already taken.'}]
      }
      if (await User.promise.findOne({'user_name' : user_name.toLowerCase()})) {
        return [false, {message: 'That user name is already taken.'}]
      }
      console.log('user' + user_name, user_name.match(/^[a-zA-Z0-9]+$/));
      if(!user_name.match(/^[a-zA-Z0-9]+$/))  
        return [false, {message: 'That user name should be alphanumric.'}];
      let user = new User()
      user.email = email
      user.blog_name = blog_name;
      user.blog_desc = blog_desc;
      user.user_name = user_name;
      user.password = password;
      try {
        await user.validate();
        user.password = await user.generateHash(password)
        return await user.save()
      }
      catch (e) {
        return [false, {message: 'Password is not valid [please check password specs in the user manual]'}]
      }

  }, {spread: true})))
}
