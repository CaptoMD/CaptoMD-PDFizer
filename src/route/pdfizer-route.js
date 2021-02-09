/*
 * Copyright (c) 2021 CaptoMD
 */

const express = require('express');
const debug = require('debug')('pdfizer:router');
const _ = require('lodash');
const { URL } = require('url');
const fs = require('fs');

const zipPdfRequest = require('../pdf/zip-pdf-request');
const zipBuilder = require('../pdf/zip-builder');
const pdfizerRequestData = require('./pdfizer-request-data');

const router = express.Router();

const electronPdfUrl = process.env.ELECTRON_PDF_SERVICE_URL || 'http://localhost:9645/';
const pdfReactorUrl = process.env.PDF_REACTOR_SERVICE_URL || 'http://localhost:9423/';

const electronPdfZipRoot = process.env.ELECTRON_PDF_ROOT_ZIP || 'src/assets/content';
const pdfReactorZipRoot = process.env.PDF_REACTOR_ROOT_ZIP || 'src/assets/shell';

const electronPdfRequest = _.partial(zipPdfRequest, electronPdfUrl);
const pdfReactorRequest = _.partial(zipPdfRequest, new URL('/service/rest/convert.pdf', pdfReactorUrl));

function pdfizer(requestData) {
  debug('Processing pdfizer request.');

  return zipBuilder(electronPdfZipRoot, requestData)
    .then(electronPdfRequest)
    .then(contentPDF => zipBuilder(pdfReactorZipRoot, requestData, [{ name: 'content.pdf', data: contentPDF }]))
    .then(pdfReactorRequest);
}

function pdfizerRequest(requestData, req, res, next) {
  pdfizer(requestData)
    .then(finalPDF => {
      res.setHeader('Content-disposition', `inline; filename="${requestData.documentInfo.filename || 'output.pdf'}"`);
      res.setHeader('Content-type', 'application/pdf');

      if (debug.enabled) {
        const fileName = `.generated/${new Date().toISOString()}.pdf`;
        debug(`Writing pdf to ${fileName}`);
        fs.writeFile(fileName, finalPDF, function(err) {
          if (err) {
            debug('Errpr while writing to file:', err);
            return console.log(err);
          }
        });
      }

      res.send(finalPDF);
    })
    .catch(reason => {
      debug('pdfizer error', reason);

      const err = _.isError(reason) ? reason : new Error(reason);
      err.status = 424;
      next(err);
    });
}

router.options('/', (req, res, _next) => {
  res.send({});
});

router.get('/print', (req, res, next) => {
  try {
    const requestData = pdfizerRequestData(req.query);
    pdfizerRequest(requestData, req, res, next);
  } catch (error) {
    debug('pdfizer error', error);
    error.status = 417;
    next(error);
  }
});

router.get('/healthcheck', (req, res) => {
  res.sendStatus(200);
});

router.post('/print', (req, res, next) => {
  try {
    const requestData = pdfizerRequestData(req.body);
    pdfizerRequest(requestData, req, res, next);
  } catch (error) {
    debug('pdfizer error', error);
    error.status = 417;
    next(error);
  }
});

module.exports = router;
