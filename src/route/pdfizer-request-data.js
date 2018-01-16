/*
 * Copyright (c) 2017 CaptoMD
 */

const _ = require('lodash');
const debug = require('debug')('pdfizer:request-data');

function pdfizerRequestData(data) {
  if (!data.content) {
    throw new Error('Request is missing data: content');
  }
  if (!data.container) {
    throw new Error('Request is missing data: container');
  }
  if (!data.documentInfo) {
    throw new Error('Request is missing data: documentInfo');
  }
  const documentInfo = Object.assign({
    filename: 'output.pdf',
    lang: 'fr',
  }, JSON.parse(data.documentInfo));

  _.set(data, 'documentInfo', documentInfo);
  debug(data);

  return data;
}

module.exports = pdfizerRequestData;
