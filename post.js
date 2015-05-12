let mongoose = require('mongoose')

let postSchema = mongoose.Schema({
  title: String,
  content: String,
  image: String,
  user_name: String,
  creation_date: { type: Date, default: Date.now},
  update_date: { type: Date, default: Date.now },
  comment_count: { type: Number, default: 0 },
  comments: [{ body: String, date: Date, user: String }] 
})


module.exports = mongoose.model('Post', postSchema)
