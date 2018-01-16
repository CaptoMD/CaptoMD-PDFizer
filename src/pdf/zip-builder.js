/*
 * Copyright (c) 2017 CaptoMD
 */

const fs = require('fs');
const path = require('path');
const async = require('async');
const JSZip = require('jszip');
const handlebars = require('handlebars');

const debug = require('debug')('pdfizer:zip-builder');
const debugTemplate = require('debug')('pdfizer:template');

const zipOptions = {
  compression: 'DEFLATE',
  platform: 'UNIX',
};

/**
 *
 * @param rootDir
 * @param templateData
 * @param otherFiles
 * @return {Promise}
 */
function zipBuilder(rootDir, templateData, otherFiles) {
  const zip = new JSZip();
  const root = path.resolve(rootDir);
  const folders = { [root]: zip };

  if (otherFiles) {
    otherFiles.forEach(({ name, data }) => {
      debug(`file: ${name}`);
      zip.file(name, data);
    });
  }

  function item(itemPath, callback) {
    fs.stat(itemPath, (err, stat) => {
      if (err) {
        callback(err);
      } else if (stat.isDirectory()) {
        const parent = path.dirname(itemPath);
        const name = path.basename(itemPath);
        folders[itemPath] = folders[parent].folder(name);
        // eslint-disable-next-line no-unused-expressions,no-use-before-define
        folder(itemPath, callback);
      } else {
        // eslint-disable-next-line no-unused-expressions,no-use-before-define
        file(itemPath, callback);
      }
    });
  }

  function file(filePath, callback) {
    const parent = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath);

    if (fileName === '.DS_Store') {
      callback();
    } else if (ext === '.png' || ext === '.otf') {
      fs.readFile(filePath, (err, data) => {
        debug(`binary: ${filePath}`);
        folders[parent].file(fileName, data, { binary: true });
        callback(err);
      });
    } else {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          callback(err);
        } else {
          if (ext === '.html') {
            const template = handlebars.compile(data);
            const resolved = template(templateData);
            debug(`html: ${filePath}`);
            debugTemplate(resolved);
            folders[parent].file(fileName, resolved);
          } else {
            debug(`utf8: ${filePath}`);
            folders[parent].file(fileName, data);
          }
          callback();
        }
      });
    }
  }

  function folder(dir, callback) {
    debug(`dir: ${dir}`);
    fs.readdir(dir, 'utf8', (err, files) => {
      if (err) {
        callback(err);
      } else {
        async.eachSeries(files, (fileItem, cb) => {
          item(path.resolve(dir, fileItem), cb);
        }, callback);
      }
    });
  }

  return new Promise((resolve, reject) => {
    folder(root, (err) => {
      if (err) {
        reject(err);
      } else {
        const stream = zip.generateNodeStream(zipOptions);
        resolve(stream);
      }
    });
  });
}

module.exports = zipBuilder;
