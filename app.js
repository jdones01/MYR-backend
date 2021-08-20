let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require('cors');

require('dotenv').config();

const uploadLimit = "1mb";

//sets the database connection details
let mongoose = require('mongoose');
let mongoDB = (process.env.MONGO_CONNECTION_STRING ? process.env.MONGO_CONNECTION_STRING : 'mongodb://127.0.0.1:27017/ecg-myr');
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;

//set the file paths for the routers
let indexRouter = require('./non-api/routes/IndexRoutes');
let adminRouter = require('./non-api/routes/AdminRoutes');
let sigcseRouter = require('./non-api/routes/SIGCSERoutes');
let apiv1 = require('./apiv1/apiv1');

//Get the default connection
let db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json({limit: uploadLimit}));
app.use(cookieParser());


// Site paths
app.use('/admin/', express.static(path.join(__dirname, 'public/admin')));
app.use('/about/', express.static(path.join(__dirname, 'public/about')));
app.use('/img/', express.static(path.join(__dirname, 'public/img')));
app.use('/models/', express.static(path.join(__dirname, 'public/models')));
app.use('/.well-known/', express.static(path.join(__dirname, 'public/.well-known')));
app.use(express.static(path.join(__dirname, 'public/myr')));
app.use('/docs/', express.static(path.join(__dirname, 'public/docs')));

//sets the relative paths for the routers
app.use('/apiv1/', apiv1);
app.use('/admin/', adminRouter);
app.use('/sigcse/', sigcseRouter);
app.use('/*', indexRouter);  //MUST BE THE LAST PATH IN THE LIST

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Handle 404
app.use(function (req, res) {
    res.status(404);
    res.render('404.jade', { title: '404: File Not Found' });
});

// Handle 500
app.use(function (error, req, res, next) {
    res.status(500);
    res.render('500.jade', { title: '500: Internal Server Error', error: error });
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

console.log('The MYR server is up and running. Good luck and have fun!');
