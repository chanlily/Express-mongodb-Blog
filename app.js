var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var routes  = require('./routes/index');
var users = require('./routes/users');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite')(__dirname);
var sha1 = require('sha1');
var http = require('http');
var mutipart= require('connect-multiparty');

var app = express();

global.dbHandel = require('./database/dbHandel');
global.db = mongoose.connect("mongodb://localhost:27017/nodedb");

//app.use(mutipart({uploadDir:'./uploads'}));
app.use(mutipart({uploadDir:'./public/uploads'}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var ejs = require('ejs');
//新引入的ejs插件
app.engine('html',ejs.__express);
app.set('view engine','html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 下边这里也加上 use(multer());
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true ,keepExtensions:true,uploadDir:'./uploads'}));
//app.use(bodyParser({uploadDir:'./uploads'}));
//设置session配置
app.use(cookieParser());
// app.use(session({
//     secret: '',
//     cookie:{
//         maxAge: 1000*60*30
//     },
// 	resave:false,//强制session保存到session store中,即使在请求中这个session没有被修改，但是这个并不一定是必须的，因为如果客户端有两个并行的请求到你的客户端，一个请求对session的修改可能被另外一个请求覆盖掉，即使第二个请求没有修改session。
// 	saveUninitialized:false
// 	//store: new redisStore({host:"mongodb//localhost:27017/nodedb"})
// }));
app.use(session({
    secret: '123',//与cookieParser中的一致
    resave: true,
    saveUninitialized:true
}));
app.use(flash());
// // set flash
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    res.locals.message = req.flash('message').toString();
    res.locals.infos = req.flash('info').toString();
    next();
});

// 下边这里也加上 use(multer())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
