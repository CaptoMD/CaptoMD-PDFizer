/*
 * Copyright (c) 2021 CaptoMD
 */

const express = require('express');
const debug = require('debug')('pdfizer:router');
const _ = require('lodash');
const { URL } = require('url');
const fs = require('fs');
const DocumentReference = require('../fhirServer/DocumentReference');
const Task = require('../fhirServer/Task');
const fhirRequest = require('../fhirServer/fhirHttpsPromise');

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

function handleError(statusCode, message) {
  debug('pdfizer error', message);
  const err = _.isError(message) ? message : new Error(message);
  err.status = statusCode;
  return err;
}

function sendReponseToFrontend(res, requestData, duplicataPDF) {
  res.setHeader('Content-disposition', `inline; filename="${requestData.documentInfo.filename || 'output.pdf'}"`);
  res.setHeader('Content-type', 'application/pdf');
  res.send(duplicataPDF);
}

function pdfizerRequest(requestData, res, next) {
  // Generate 2 pdf and send 1 to DPE and return the other to client
  if (requestData.documentInfo.pushUrl) {
    const url = requestData.documentInfo.pushUrl;
    pdfizer(requestData)
      .then(duplicataPDF => {
        // If all goes well, we launch the second generation and send to DPE
        pdfizer(requestData)
          .then(finalPDFToSendToDPE => {
            let fhirDocumentReference = new DocumentReference(
              requestData.documentInfo.fhirPatientId,
              requestData.documentInfo.fhirPractitionerId,
              finalPDFToSendToDPE.toString('base64')
            );
            return fhirRequest(url, '/DocumentReference/', 'POST', fhirDocumentReference);
          })
          .then(fhirDocumentReferenceResponse => {
            let fhirTask = new Task(JSON.parse(fhirDocumentReferenceResponse.body).id);
            return fhirRequest(url, '/Task/', 'POST', fhirTask);
          })
          .then(_fhirTaskResponse => {
            if (debug.enabled) {
              const fileName = `.generated/${new Date().toISOString()}.pdf`;
              debug(`Writing pdf to ${fileName}`);
              fs.writeFile(fileName, duplicataPDF, function(err) {
                if (err) {
                  debug('Errpr while writing to file:', err);
                  return console.log(err);
                }
              });
            }
            sendReponseToFrontend(res, requestData, duplicataPDF);
          })
          .catch(error => {
            debug('pdfizer error', error);
            next(handleError(error.statusCode, error.body));
          });
      })
      .catch(error => {
        debug('pdfizer error', error);
        next(handleError(error.statusCode, error.body));
      });
  } else {
    pdfizer(requestData)
      .then(finalPDF => {
        sendReponseToFrontend(res, requestData, finalPDF);
      })
      .catch(error => {
        debug('pdfizer error', error);
        next(handleError(error.statusCode, error.body));
      });
  }
}

router.options('/', (req, res, _next) => {
  res.send({});
});

router.get('/print', (req, res, next) => {
  try {
    const requestData = pdfizerRequestData(req.query);
    pdfizerRequest(requestData, res, next);
  } catch (error) {
    debug('pdfizer error', error);
    next(handleError(417, 'Expectation Failed'));
  }
});

router.get('/healthcheck', (req, res) => {
  res.sendStatus(200);
});

router.post('/print', (req, res, next) => {
  try {
    const requestData = pdfizerRequestData(req.body);
    pdfizerRequest(requestData, res, next);
  } catch (error) {
    debug('pdfizer error', error);
    next(handleError(417, 'Expectation Failed'));
  }
});

module.exports = router;
