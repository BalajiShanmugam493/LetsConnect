var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var validator = require('express-validator');
var handlebars = require('express-handlebars');
//var flash = require('connect-flash');
var passport = require('passport'); 
var mongo  = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://ajayTest:ajay2112@ds147469.mlab.com:47469/testsocial');
var db = mongoose.connection;

//var router = express.Router();
var routes = require('./routes/index.js');
var users = require('./routes/users.js');


var path = require("path");


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(eyespect());
app.use(validator());
 app.use(session({secret: 'secret key', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());


app.engine('hbs', handlebars({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));


app.use(validator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.'),
    root = namespace.shift(), 
    formParam = root;
    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return{
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));


app.use('/', routes);
app.use('/users', users);


app.set('port', (process.env.PORT || 9000));


var server = app.listen(app.get('port'), function () {
  console.log("App listening at http://"+app.get('port'));
});


 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


