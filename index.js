var express = require('express')
var path = require('path')
var logger = require('morgan')
var router = require('./router/router')
var app = express()

const port = 80

app.use(express.static(path.join(__dirname, 'public')))
console.log(path.join(__dirname, 'public'))
app.use('/', router)

app.listen(port, function() {
    console.log('Elections server listening on port ' + port)
})



app.use(logger('dev'))

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}



module.exports = app;
