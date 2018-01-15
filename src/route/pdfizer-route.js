/*
 * Copyright (c) 2017 CaptoMD
 */

const express = require('express');
const debug = require('debug')('pdfizer:router');
const _ = require('lodash');

const zipPdfRequest = require('../pdf/zip-pdf-request');
const zipBuilder = require('../pdf/zip-builder');
const pdfizerRequest = require('./pdfizer-request');

const router = express.Router();

const electronPdfUrl = process.env.ELECTRON_PDF_SERVICE_URL || 'http://localhost:9645/';
const pdfReactorUrl = process.env.PDF_REACTOR_SERVICE_URL || 'http://localhost:9423/service/rest/convert.pdf';

const electronPdfZipRoot = process.env.ELECTRON_PDF_ROOT_ZIP || 'src/assets/content';
const pdfReactorZipRoot = process.env.PDF_REACTOR_ROOT_ZIP || 'src/assets/shell';

const electronPdfRequest = _.partial(zipPdfRequest, electronPdfUrl);
const pdfReactorRequest = _.partial(zipPdfRequest, pdfReactorUrl);

function pdfizer(requestData) {
  debug('Processing pdfizer request.', requestData);

  return zipBuilder(electronPdfZipRoot, requestData)
    .then(electronPdfRequest)
    .then((contentPDF) => {
      debug('content.pdf', contentPDF);
      return zipBuilder(pdfReactorZipRoot, requestData, [{ name: 'content.pdf', data: contentPDF }]);
    })
    .then(pdfReactorRequest);
}

router.options('/', (req, res, _next) => {
  res.send({});
});

router.get('/', (req, res, next) => {
  try {
    const requestData = pdfizerRequest(req.query);
    pdfizer(requestData)
      .then((finalPDF) => {
        res.setHeader('Content-disposition', `inline; filename="${requestData.filename || 'output.pdf'}"`);
        res.setHeader('Content-type', 'application/pdf');
        res.send(finalPDF);
      })
      .catch((reason) => {
        debug(`error. ${reason}`);

        const err = new Error(reason);
        err.status = 424;
        next(err);
      });
  } catch (error) {
    debug(error);
    error.status = 417;
    next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    const requestData = pdfizerRequest(req.body);
    pdfizer(requestData)
      .then((finalPDF) => {
        res.setHeader('Content-disposition', `inline; filename="${requestData.filename || 'output.pdf'}"`);
        res.setHeader('Content-type', 'application/pdf');
        res.send(finalPDF);
      })
      .catch((reason) => {
        debug(`error. ${reason}`);

        const err = new Error(reason);
        err.status = 424;
        next(err);
      });
  } catch (error) {
    debug(error);
    error.status = 417;
    next(error);
  }
});

module.exports = router;
