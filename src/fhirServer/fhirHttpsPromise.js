'use strict';

const https = require('https');

module.exports = (url, path, method, obj) => {
  return new Promise((resolve, reject) => {
    const splitedUrl = url.split('/');
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
    console.info('data sent to server', data);
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk.toString()));
      res.on('error', () => {
        reject({ status: 500, body: 'Internal Server Error' });
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode <= 299) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: body });
        } else {
          reject({ statusCode: res.statusCode, body: body });
        }
      });
    });
    req.on('error', () => {
      reject({ status: 500, body: 'Internal Server Error' });
    });
    req.write(data);
    req.end();
  });
};
