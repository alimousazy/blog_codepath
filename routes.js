let isLoggedIn = require('./middleware/isLoggedIn')

module.exports = (app) => {
  let passport = app.passport

  app.get('/', (req, res) => {
    res.render('index.ejs', {message: req.flash('error')})
  })
  app.get('/signup', (req, res) => {
    res.render('signup.ejs', {message: req.flash('error')})
  })
  app.get('/post/:id?', isLoggedIn, async (req, res) => {
    let Post = require('./post.js');
    let id = req.param('id');
    let post = {};
    if(id)
    {
      try 
      {
        post = await Post.promise.findOne( { '_id' : req.param('id'), 'user_name' : req.user.user_name });
      }
      catch (e)
      {
        console.log(e.stack);
      }
    }
    res.render('post.ejs', {message: req.flash('error'), post: post})
  })
  app.post('/post/:id?', isLoggedIn, async (req, res) => {
    let Post = require('./post.js');
    let id = req.param('id');
    let post;
    if(id) {
       post = await Post.promise.findOne( { '_id' : req.param('id'), 'user_name' : req.user.user_name });
       post.update_date = new Date();
    }
    else {
      post = new Post();
    }
    post.title = req.body.title;
    post.content = req.body.content;
    post.user_name   = req.user.user_name;
    if(req.files.image)
      post.image   = req.files.image.path;
    post.comment_count = 0;
    try {
      await post.save();
    }
    catch (e) {
      console.log(e.stack);
    }
    finally {
      res.redirect('/profile');
    }
  })


  app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
  }))
  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  app.get('/delete/:id', isLoggedIn, async (req, res) => {
    let Post = require('./post.js');
    let result;
    try {
      //this also should look for user id so in search and search and use it in search critieria 
      result = await Post.find(
        {
          '_id' : req.param('id'),
          'user_name' : req.user.user_name 
        
        }
        ).remove();
    } 
    catch (e) {
      console.log(e.stack);
    }
    res.redirect('/profile');
  })

  app.post('/blog/:id', isLoggedIn, async (req, res) => {
    let Post = require('./post.js');
    let post = {};
    let id  = req.param('id');
    console.log(req.body);
    try {
      post = await Post.promise.findOne({'_id' : req.body.p_id });
      post.comments.push({
        'body': req.body.comment,
        'user': req.user.user_name,
        'date': new Date() 
      });
      post.comment_count++;
      await post.save();
    } 
    catch (e) {
      console.log(e.stack);
    }
    finally {
      res.redirect("/blog/" + id);
    }
  })

  app.get('/blog/:id', isLoggedIn, async (req, res) => {
    let Post = require('./post.js');
    let list = [];
    let id  = req.param('id');
    try {
      list = await Post.promise.find({'user_name' : id });
    } 
    catch (e) {
      console.log(e.stack);
    }
    res.render('blog.ejs', {
      user: id,
      message: req.flash('error'),
      posts : list
    })
  })

  app.get('/profile', isLoggedIn, async (req, res) => {
    let Post = require('./post.js');
    let list = [];
    try {
      list = await Post.promise.find({'user_name' : req.user.user_name });
    } 
    catch (e) {
      console.log(e.stack);
    }
    res.render('profile.ejs', {
      user: req.user,
      message: req.flash('error'),
      posts : list
    })
  })

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })
}
