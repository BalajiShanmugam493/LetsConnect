var express = require('express');
var router = express.Router();

router.get('/',function(req,res){
  console.log("index page");
  //res.sendFile(path.join(__dirname+'/views/index.html'));
  res.redirect('/users/signup');
  /*__dirname : It will resolve to your project folder (i.e.) C:\Users\Sys\Desktop\Test*/
  //res.render('index');
});


module.exports = router;