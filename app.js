var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');
var session=require('express-session')
const expressEjsLayouts=require('express-ejs-layouts')
const toastr= require('toastr')
const flash = require('express-flash');
const Razorpay = require('razorpay');
const PDFDocument= require('pdfkit')
const fs= require('fs')

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const db=require('./config/connection')



var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.engine('ejs', ejs.renderFile);
// app.set('view options', {layout: 'layout', layoutsDir: __dirname + '/views/layouts'});
app.set('layout','layouts/layout')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/admin-assets')));
app.use(expressEjsLayouts)



app.use(session({
  secret:'key',
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
    // maxAge: 5000 // 10 days
  },
  resave:false
}))
app.use(function nocache (req, res, next) {
  res.header('Cache-Control', 'private, no-cache ,no-store, must revalidate')
  res.header('Expires', '-1')
  res.header('Pragma', 'no-cache')
  next()
})

app.use(flash());

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

// httpOnly: true, // cookie cannot be accessed by client-side scripts
// secure: true, // cookie will only be sent over HTTPS