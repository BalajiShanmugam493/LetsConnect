var express = require('express');
//var app = express();
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
var multer = require('multer');
//var path = require("path");

//app.use(express.static(path.join(__dirname, 'public/images')));

var storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, './public/images');
  },
  filename: function(req, file, callback){
    callback(null, req.user._id+"-"+Date.now()+".jpeg");
  }
});
var upload = multer({
  storage: storage, 
  limits: {fileSize: 50000000},
  fileFilter: function(req, file, cb){
  const filetypes = /jpeg|jpg|png|gif/;
  if(filetypes.test(file.mimetype)){
    return cb(null, true);
  }
  else{
    cb('Error: Images Only!');
  }
}}).single('inputPhoto');

var storageDp = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, './public/images');
  },
  filename: function(req, file, callback){
    callback(null, req.user._id+"-dp.jpeg");
  }
});

var uploadDp = multer({
  storage: storageDp, 
  limits: {fileSize: 50000000},
  fileFilter: function(req, file, cb){
  const filetypes = /jpeg|jpg|png|gif/;
  if(filetypes.test(file.mimetype)){
    return cb(null, true);
  }
  else{
    cb('Error: Images Only!');
  }
}}).single('inputDp');

//var mailer = require('nodemailer');
var User = require('../models/user');
//var Post = require('../models/post');

var util = require('util');

router.get('/signup',function(req, res){
  console.log("redirected to signup");
  //res.sendFile(path.join(__dirname+'/views/signup.html'));
  res.render('signup', {title: "Sign up", condition: false});
});


router.post('/signup', function(req, res, next){
  console.log("in signup submit");
  console.log(req.body);
  req.checkBody('username', 'Enter a valid Name!').notEmpty().isLength({min: 3});
  req.checkBody('email', 'Invalid email Address!').isEmail();
  req.checkBody('password', 'Incorrect password!').isLength({min: 6}).equals(req.body.confirmPassword);
  

  var errors = req.validationErrors();
  if(errors){
    console.log("Errors in signup");
    var error_msg = errors[0].msg;
    console.log("error msg:"+error_msg);
    req.session.errors = errors;
    req.session.success = false;
    //res.writeHead(406, {"Content-Type": "application/json"});
    //req.flash('error_msg', errors[0].msg);
    var response = {status : 406, msg : error_msg };
    res.send(JSON.stringify(response));
  }
  else{
    console.log("signup validation successful");
    req.session.success = true;
    
    var newUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      dob: req.body.dob,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      gender: req.body.gender,
      country: req.body.country
    };
    
    console.log("newUser:"+JSON.stringify(newUser));
    User.createUser(newUser, req, res, function( res, response){
      console.log("in callback: response = "+JSON.stringify(response));
      res.send(JSON.stringify(response));
    });
  }

});


router.get('/login',function(req, res){
  console.log("redirected to login");
  //res.sendFile(path.join(__dirname+"/views/login.html"));
  res.render('login', { title: "Log in", condition: false});
});


passport.use(new LocalStrategy(
  function(username, password, done) {
    //process.nextTick(function () {
      User.getUserByName(username, function(err, user){
        if(err) throw err;
        if(!user){
          return done(null, false, {message: 'Unknown user'});
        }
        User.comparePassword(password, user.password, function(err, isMatch){
          if(err)throw err;
          if(isMatch){
            return  done(null, user);
          }
          else return done(null, false, {message: 'Incorrect password'});
        });
      }  
    )
  //})
}));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(null, user);
  });
});


router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    // Redirect if it fails
    if (!user) {
      //req.flash('error_msg', 'Login failed!'); 
      var response = {status : 406, msg : "Incorrect Username/password!"};
      res.send(JSON.stringify(response));
      //return res.redirect('/login'); 
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      //Redirect if it succeeds
      console.log("logged in user "+req.session.passport.user);
      var response = {status : 200, msg : "Login successful!", user: req.session.passport.user};
      res.send(JSON.stringify(response));
      //return res.redirect('/users/homepage');//'/users/' + user.username
    });
  })(req, res, next);
});


router.get('/logout', function(req, res){
  console.log("in logout");
  req.logout();
  //res.send(JSON.stringify(response));
  res.redirect('/users/login');
});


router.get('/homepage', function(req, res){
  console.log("in homepage get()");
  //console.log("req:"+util.inspect(req));
  if(req.isAuthenticated()){
    //res.sendFile(path.join(__dirname+"/views/homepage.html"));
    res.render('homepage', { title: "Homepage", username:req.user.username, dp: req.user.profilepic, condition: false});
  }
  else{
    console.log("not logged in");
    //var response = {status : 406, msg : "<div class='alert alert-danger'>You are not logged in!<br></div>" };
    res.redirect('/users/login');
  }
  
});


router.get('/searchpeople', function(req, res){
  console.log('in searchpeople GET ---- key:'+JSON.stringify(req.data));
  User.findFriends(req.query, req, res, function(res, result){
    console.log("in callback :"+result.length);
    res.send(result);
  });
});


router.get('/sendrequest', function(req, res){
  console.log('in sendrequest GET\nto user:'+JSON.stringify(req.query));
  //console.log('req:'+util.inspect(req));
  console.log('current user:'+req.session.passport.user);
  User.sendRequest(req.query, req, res, function(res, result ){
    console.log("in sendrequest callback :"+JSON.stringify(result));
    res.send(result);
  });
});

router.get('/showrequests', function(req,res){
  console.log('in showrequests GET\nof user:'+JSON.stringify(req.session.passport.user));
  User.showRequests(req,res,function(res, resArr){
    console.log("in showrequests callback :"+resArr.length);
    res.send(resArr);
  });
});


router.get('/acceptrequest', function(req, res){
  console.log('in acceptrequest GET\nto user:'+JSON.stringify(req.query));
  //console.log('req:'+util.inspect(req));
  console.log('current user:'+req.session.passport.user);
  User.acceptRequest(req.query, req, res, function(res, result ){
    console.log("in acceptrequest callback :"+JSON.stringify(result));
    res.send(result);
  });
});

router.get('/showfriends', function(req,res){
  console.log('in showfriends GET\nof user:'+JSON.stringify(req.session.passport.user));
  User.showFriends(req,res,function(res, resArr ){
    console.log("in showfriends callback :"+resArr.length+" results found.");
    res.send(resArr);
  });
});


router.get('/postmessage', function (req, res) {
   //console.log("inside postmessage "+req.body);
   console.log("in post message"+JSON.stringify(req.query));
   User.postMessage(req.query, req, res,function(res, result){
    console.log("in postmessage callback :"+result);
    res.send(result);
  });
});


router.post('/postphoto', function(req, res, next){
  console.log("in post photo POST");
  upload(req, res, function(err){
    if(err){
      throw err;
      //window.alert('Error occured while uploading!');
      //res.sendFile(path.join(__dirname+"/views/homepage.html"));
      res.render('homepage', { msg: "Unable to post image!" });
    }
    else{
      console.log("upload successful"+req.file);
      //window.alert('file uploaded');
      var postData = {
        postcontent: req.file.filename,
      }
      User.postMessage(postData, req, res,function(res, result){
        console.log("in callback: response = "+JSON.stringify(result));
        res.redirect(result.status, 'homepage');   
      });
    }
  });
});



router.post('/changedp', function(req, res, next){
  console.log("in post photo POST");
  uploadDp(req, res, function(err){
    if(err){
      throw err;
      res.render('homepage', { msg: "Unable to change profile pic!" });
    }
    else{
      console.log("upload successful"+req.file);
      //window.alert('file uploaded');
      var newImage = {
        path: req.file.filename,
      }
      User.changeProfilePic(newImage, req, res,function(res, result){
        console.log("in callback: response = "+JSON.stringify(result));
        res.redirect('homepage');   
      });
    }
  });
});


router.get('/getposts', function (req, res) {
   //console.log("inside getposts ");
   //console.log('req:'+util.inspect(req));
   console.log("in getposts of user:"+JSON.stringify(req.session.passport.user));
   User.getPosts(req, res,function(res, result){
    console.log("in getposts callback :"+result.length+" results found");
    var response = {"result" : result, "username": req.user.username};
    res.send(response);
  });
});


router.get('/likepost', function (req, res) {
   console.log("in likepost of user:"+JSON.stringify(req.session.passport.user));
   User.likePost(req.query.id, req, res,function(res, response){
    console.log("in likepost callback :"+response.likes.length+" results found");
    res.send(response);
  });
});


router.post('/commentpost', function (req, res, next) {
   //console.log('req:'+util.inspect(req));
   console.log("in commentpost of user:"+req.session.passport.user);
   User.commentPost(req, res,function(res, response){
    console.log("in commentpost callback");
    res.send(response);
  });
});


router.get('/myprofile',function(req, res){
  console.log("redirected to user profile");
  //res.sendFile(path.join(__dirname+'/views/signup.html'));
  if(req.isAuthenticated()){
    //res.sendFile(path.join(__dirname+"/views/homepage.html"));
    res.render('profilepage', {title: req.query.username, 
      id: req.user._id, 
      dp: req.user.profilepic, 
      username: req.user.username,
      condition: false
    });
  }
  else{
    console.log("not logged in");
    //var response = {status : 406, msg : "<div class='alert alert-danger'>You are not logged in!<br></div>" };
    res.redirect('/users/login');
  }
  
});


router.get('/friendprofile-:id',function(req, res){
  console.log("redirected to user profile");
  if(req.isAuthenticated()){
    //res.sendFile(path.join(__dirname+"/views/homepage.html"));
    User.getDp(req.params.id, req, res, function(res, response){
      res.render('profilepage',{
        title: response.username, 
        id: req.params.id, 
        username: response.username, 
        dp: response.dp, 
        condition: false
      });    
    });
  }
  else{
    console.log("not logged in");
    //var response = {status : 406, msg : "<div class='alert alert-danger'>You are not logged in!<br></div>" };
    res.redirect('/users/login');
  }
});


router.get('/userposts', function (req, res) {
   //console.log("inside getposts ");
   //console.log('req:'+util.inspect(req));
   console.log("in profile of user:"+JSON.stringify(req.session.passport.user));
   User.getPostsByUser(req.query.id, req, res, function(res, response){
    console.log("in profile callback :"+response.result.length+" results found");
    res.send(response);
  });
});


module.exports = router;