var express = require('express');
var router = express.Router();

router.get('/',function(req,res){
  //console.log("index page");
  res.redirect('/users/signup');
});


module.exports = router;