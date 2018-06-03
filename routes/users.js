var express = require('express');
//var app = express();
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
var multer = require('multer');
//var path = require("path");

//app.use(express.static(path.join(__dirname, 'public/images')));

//var mailer = require('nodemailer');
var User = require('../models/user');
//var Post = require('../models/post');

var util = require('util');


router.get('/', function(req, res){
  //console.log("redirected to signup");
  if(req.isAuthenticated()){
    res.redirect('homepage');
  }
  else{
    res.redirect('signup');
  }
  //res.sendFile(path.join(__dirname+'/views/signup.html'));
  
});

router.get('/template', function(req, res){
  res.render('template');
});


router.get('/signup',function(req, res){
  //console.log("redirected to signup");
  if(req.isAuthenticated()){
    res.redirect('homepage');
  }
  else{
    res.render('signup', {title: "Sign up", condition: false});
  }
  //res.sendFile(path.join(__dirname+'/views/signup.html'));
  
});


router.post('/signup', function(req, res, next){
  //console.log("in signup submit");
  //console.log(req.body);
  req.checkBody('username', 'Enter a valid Name!').notEmpty().isLength({min: 3});
  req.checkBody('email', 'Invalid email Address!').isEmail();
  req.checkBody('password', 'Incorrect password!').isLength({min: 6});
  req.checkBody('password', 'Passwords do not match!').equals(req.body.confirmPassword);
  

  var errors = req.validationErrors();
  if(errors){
    //console.log("Errors in signup");
    var error_msg = errors[0].msg;
    //console.log("error msg:"+error_msg);
    req.session.errors = errors;
    req.session.success = false;
    //res.writeHead(406, {"Content-Type": "application/json"});
    //req.flash('error_msg', errors[0].msg);
    var response = {status : 406, msg : error_msg };
    res.render('signup', response);
  }
  else{
    //console.log("signup validation successful");
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
    
    //console.log("newUser:"+JSON.stringify(newUser));
    User.createUser(newUser, req, res, function( res, response){
      //console.log("in callback: response = "+JSON.stringify(response));
      //res.send(JSON.stringify(response));
      if(response.status == 200){
        res.redirect('login');
      }
      else {
        res.render('signup', response);
      }
    });
  }

});


router.get('/login',function(req, res){
  //console.log("redirected to login");
  //res.sendFile(path.join(__dirname+"/views/login.html"));
  if(req.isAuthenticated()){
    res.redirect('homepage');
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  }
  
});


passport.use(new LocalStrategy(
  function(username, password, done){
    //console.log("in local strategy callback");
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
    });
  }
));


passport.serializeUser(function(user, done) {
  //console.log("in serializeUser");
  done(null, user.id, {msg: "serializer msg"});
});

passport.deserializeUser(function(id, done) {
  //console.log("in deserializeUser");
  User.getUserById(id, function(err, user) {
    done(null, user, {msg: "deserializer msg"});
  });
});


router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    //console.log("in authenticate callback - user: "+user+" info: "+JSON.stringify(info));
    if (err) return next(err); 
    if(!user) {
      var response = {status : 406, msg : "Incorrect Username/password!"};
      //res.send(JSON.stringify(response));
      return res.render('login', response); 
    }
    else{
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        //console.log("logged in user "+req.session.passport.user);
        var response = {status : 200, msg : "Login successful!", user: req.session.passport.user};
        //res.send(JSON.stringify(response));
        res.redirect('homepage');
      });
    }
  })(req, res, next);
});


router.get('/logout', function(req, res){
  //console.log("in logout");
  req.logout();
  //res.send(JSON.stringify(response));
  res.redirect('/users/login');
});


router.get('/homepage', function(req, res){
  //console.log("in homepage get()");
  ////console.log("req:"+util.inspect(req));
  if(req.isAuthenticated()){
    //res.sendFile(path.join(__dirname+"/views/homepage.html"));
    res.render('homepage', { title: "Homepage", username:req.user.username, dp: req.user.profilepic, condition: false});
  }
  else{
    //console.log("not logged in");
    //var response = {status : 406, msg : "<div class='alert alert-danger'>You are not logged in!<br></div>" };
    res.redirect('/users/login');
  }
  
});


router.get('/searchpeople', function(req, res){
  //console.log('in searchpeople GET ---- key:'+JSON.stringify(req.query));
  if(req.isAuthenticated()){
    User.findFriends(req.query, req, res, function(res, result){
      //console.log("in callback :"+result.length+" results found!");
      var response = {people: result, user: req.user};
      res.send(response);
    });
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  }  
});


router.get('/sendrequest', function(req, res){
  //console.log('in sendrequest GET\nto user:'+JSON.stringify(req.query));
  if(req.isAuthenticated()){
    //console.log('current user:'+req.session.passport.user);
    User.sendRequest(req.query, req, res, function(res, result ){
      //console.log("in sendrequest callback :"+JSON.stringify(result));
      res.send(result);
    });
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  }

  
});

router.get('/showrequests', function(req,res){
  if(req.isAuthenticated()){
    //console.log('in showrequests GET\nof user:'+JSON.stringify(req.session.passport.user));
    User.showRequests(req,res,function(res, resArr){
      //console.log("in showrequests callback :"+resArr.length);
      res.send(resArr);
    });
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  }
});


router.get('/acceptrequest', function(req, res){
  //console.log('in acceptrequest GET\nto user:'+JSON.stringify(req.query));
  if(req.isAuthenticated()){
    //console.log('current user:'+req.session.passport.user);
    User.acceptRequest(req.query, req, res, function(res, result ){
      //console.log("in acceptrequest callback :"+JSON.stringify(result));
      res.send(result);
    });
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  }
});

router.get('/showfriends', function(req,res){
  //console.log('in showfriends GET\nof user:'+JSON.stringify(req.session.passport.user));
  if(req.isAuthenticated()){
    User.showFriends(req,res,function(res, resArr ){
      //console.log("in showfriends callback :"+resArr.length+" results found.");
      res.send(resArr);
    });
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  }
});


router.post('/homepage', function(req, res, next){
  //console.log("in post photo POST");
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
  }}).single('postImage');


  upload(req, res, function(err){
    //console.log(util.inspect(req));
    if(err){
      throw err;
      //window.alert('Error occured while uploading!');
      //res.sendFile(path.join(__dirname+"/views/homepage.html"));
      res.render('homepage', {msg: "Your post has failed!"});
    }
    else{
      //console.log("upload successful"+req.file);
      //window.alert('file uploaded');
      var postData = {
        posttext: req.body.postText,
        postimage: req.file == undefined ? "" : req.file.filename
      }
      User.postMessage(postData, req, res,function(res, result){
        //console.log("in callback: response = "+JSON.stringify(result));
        res.render('homepage', {msg: "You've just posted!", "username": req.username});
      });
    }
  });
});


router.get('/getposts', function (req, res) {
   if(req.isAuthenticated()){
    //console.log("in getposts of user:"+JSON.stringify(req.session.passport.user));
     User.getPosts(req, res,function(res, result){
      //console.log("in getposts callback :"+result.length+" results found");
      var response = {"result" : result, "user": req.user};
      //console.log(response);
      res.send(response);
    });
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  }  
});


router.get('/likepost', function (req, res) {
  //console.log("in likepost of user:"+JSON.stringify(req.session.passport.user));
  if(req.isAuthenticated()){
    User.likePost(req.query.id, req, res,function(res, response){
      //console.log("in likepost callback :"+response.likes.length+" results found");
      res.send(response);
    });
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  }   
});


router.post('/commentpost', function (req, res, next) {
   //console.log("in commentpost of user:"+req.session.passport.user);
   if(req.isAuthenticated()){
    User.commentPost(req, res,function(res, response){
      //console.log("in commentpost callback");
      res.send(response);
    });
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  } 
});

var calculateAge = function(dob){
  var ageDifMs = Date.now() - dob.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

router.get('/myprofile',function(req, res){
  //console.log("redirected to user profile");
  if(req.isAuthenticated()){
    //res.sendFile(path.join(__dirname+"/views/homepage.html"));
    res.render('profilepage', {title: req.query.username, 
      id: req.user._id, 
      dp: req.user.profilepic, 
      username: req.user.username,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      age: calculateAge(req.user.dob),
      country: req.user.country,
      condition: false
    });
  }
  else{
    //console.log("not logged in");
    //var response = {status : 406, msg : "<div class='alert alert-danger'>You are not logged in!<br></div>" };
    res.redirect('/users/login');
  }
  
});

router.post('/changedp', function(req, res, next){
  //console.log("in change profilepic POST");
  if(req.isAuthenticated()){
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

    uploadDp(req, res, function(err){
      if(err){
        throw err;
        res.render('homepage', { msg: "Unable to change profile pic!" });
      }
      else{
        //console.log("upload successful"+req.file);
        //window.alert('file uploaded');
        var newImage = {
          path: req.file.filename,
        }
        User.changeProfilePic(newImage, req, res,function(res, result){
          //console.log("in callback: response = "+JSON.stringify(result));
          res.render('profilepage', {title: req.query.username, 
            id: req.user._id, 
            dp: req.user.profilepic, 
            username: req.user.username,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            age: calculateAge(req.user.dob),
            country: req.user.country,
            condition: false
          }); 
        });
      }
    });
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  }
});


router.get('/friendprofile-:id',function(req, res){
  //console.log("redirected to user profile");
  if(req.isAuthenticated()){
    //res.sendFile(path.join(__dirname+"/views/homepage.html"));
    User.getFriendProfile(req.params.id, req, res, function(res, response){
      res.render('friendprofile',{
        id: response._id, 
        dp: response.profilepic, 
        username: response.username,
        firstname: response.firstname,
        lastname: response.lastname,
        age: calculateAge(response.dob),
        country: response.country,
        condition: false
      });    
    });
  }
  else{
    //console.log("not logged in");
    //var response = {status : 406, msg : "<div class='alert alert-danger'>You are not logged in!<br></div>" };
    res.redirect('/users/login');
  }
});


router.get('/userposts', function (req, res) {
   ////console.log("inside getposts ");
   ////console.log('req:'+util.inspect(req));
   if(req.isAuthenticated()){
    //console.log("in profile of user:"+JSON.stringify(req.session.passport.user));
    User.getPostsByUser(req.query.id, req, res, function(res, response){
      //console.log("in profile callback :"+response.result.length+" results found");
      res.send(response);
    });
  }
  else{
    res.render('login', { title: "Log in", condition: false});
  }   
});


module.exports = router;