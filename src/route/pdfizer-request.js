/*
 * Copyright (c) 2017 CaptoMD
 */

const _ = require('lodash');

const pdfizerDefaultValues = require('./pdfizer-defaults');

function pdfizerRequestData(data) {
  if (!data.content) {
    throw new Error('Missing content data');
  }
  if (!data.container) {
    throw new Error('Missing container data');
  }

  return _.defaults(data, pdfizerDefaultValues);
}

module.exports = pdfizerRequestData;
