/*
 * Copyright (c) 2017 CaptoMD
 */

const request = require('request');
const debug = require('debug')('pdfizer:pdf-request');

/**
 *
 * @param url
 * @param zipBody
 * @return {Promise}
 */
function zipPdfRequest(url, zipBody) {
  return new Promise((resolve, reject) => {
    // Send request
    request({
      url,
      body: zipBody,
      method: 'POST',
      encoding: null,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/zip',
      },
    }, (err, response, body) => {
      if (err) {
        reject(err);
        return;
      }

      debug(`${url} response: ${response.statusCode} ${response.statusMessage}`);

      if (response.statusCode !== 200) {
        reject(new Error(`${this.url}: ${response.statusCode} ${response.statusMessage}`));
        return;
      }

      resolve(body);
    });
  });
}

module.exports = zipPdfRequest;
