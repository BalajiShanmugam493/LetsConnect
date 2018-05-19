var express = require('express');
var router = express.Router();

router.get('/',function(req,res){
  console.log("index page");
  //console.log("dir name:"+__dirname);
  //res.sendFile(path.join(__dirname+'/views/index.html'));
  res.redirect('/users/signup');
  /*__dirname : It will resolve to your project folder (i.e.) C:\Users\Sys\Desktop\Test*/
});


module.exports = router;