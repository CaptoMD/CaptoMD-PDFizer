'use strict';

const http = require('http');
const https = require('https');

module.exports = (url, path, method, obj) => {
  return new Promise((resolve, reject) => {
    const splitedUrl = url.split('/');
    const protocol = splitedUrl[2];
    const hostName = splitedUrl[2];
    const fullPath = '/' + splitedUrl[3] + path;
    const data = JSON.stringify(obj);
    const options = {
      hostname: hostName,
      path: fullPath,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    let handler;
    if (protocol === 'https:') {
      console.info('sending over https to FHir Server', url, options);
      handler = https;
    } else {
      console.info('sending over http to FHir Server', url, options);
      handler = http;
    }
    const req = handler.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk.toString()));
      res.on('error', () => {
        console.error('Fhir Server Error', { status: 500, body: 'Internal Server Error' });
        reject({ status: 500, body: 'Internal Server Error' });
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode <= 299) {
          console.info('Fhir Server Success', { statusCode: res.statusCode, body: body });
          resolve({ statusCode: res.statusCode, headers: res.headers, body: body });
        } else {
          console.error('Fhir Server Error', { statusCode: res.statusCode, body: body });
          reject({ statusCode: res.statusCode, body: body });
        }
      });
    });
    req.on('error', () => {
      console.error('Fhir Server Error', { status: 500, body: 'Internal Server Error' });
      reject({ status: 500, body: 'Internal Server Error' });
    });
    req.write(data);
    req.end();
  });
};
