let mongoose = require('mongoose')
let bcrypt = require('bcrypt')

require('songbird')

let userSchema = mongoose.Schema({
  user_name: String,
  email: String,
  password: String,
  blog_name: String,
  blog_desc: String
})

userSchema.methods.generateHash = async function(password) {
  return await bcrypt.promise.hash(password, 8)
}
userSchema.path('password').validate((password) => {
  if(password.length < 4  ||
     !password.match(/[A-Z]/)  ||
     !password.match(/[a-z]/)  ||
     !password.match(/[0-9]/))
  {
    return false;
  }
  return true;
})

userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.promise.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
