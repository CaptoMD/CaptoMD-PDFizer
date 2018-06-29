const Raven = require('raven');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const pdfizer = require('./route/pdfizer-route');

const app = express();
Raven.config(process.env.PDFIZER_RAVEN_URL || '').install();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false, limit: '6mb' }));
app.use('/', pdfizer);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, _next) => {
  Raven.captureException(err);
  // set locals, only providing error in development
  const { message } = err;
  const error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({ error, message });
});

module.exports = app;
