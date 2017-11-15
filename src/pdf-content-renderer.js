/*
 * Copyright (c) 2017 CaptoMD
 */

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const JSZip = require('node-zip');
const request = require('request');
const uuidv4 = require('uuid/v4');

class PdfContentRenderer {

    /**
     *
     * @param content
     * @param params
     * @returns {Promise}
     */
    render (content, params) {
        return new Promise((resolve, reject) =>
        {
            const uuid = uuidv4();
            const tempZipFile = path.join(config.TMP_FOLDER, `${uuid}.zip`);

            try
            {
                let template = fs.readFileSync(path.join(config.ELECTRON_PDF.SOURCE_FOLDER, 'template.html'), 'utf8');
                template = PdfContentRenderer.replaceStrings(template, content, params);
                // console.log(template);

                // ZIP Asset Packages:
                const zipped = PdfContentRenderer.makeZip(template);
                fs.writeFileSync(tempZipFile, zipped, 'binary');
            }
            catch (err)
            {
                reject(err);
                return;
            }

            // Read Zip as Buffer:
            fs.readFile(tempZipFile, (readError, zip) =>
            {
                fs.unlinkSync(tempZipFile);

                if (readError)
                {
                    reject(readError);
                    return;
                }

                // Send request
                request({
                    url: config.ELECTRON_PDF.SERVICE,
                    method: 'POST',
                    body: zip,
                    encoding: null,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/zip',
                    },
                }, (err, response, body) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }

                    if (config.DEBUG_MODE && _.has(response, 'statusCode'))
                    {
                        console.log(`PdfContentRenderer response: ${response.statusCode} ${response.statusMessage}`);
                    }

                    if (response.statusCode == 200)
                    {
                        fs.writeFile(path.join(config.TMP_FOLDER, `content_${uuid}.pdf`), body);
                        resolve(body);
                        return;
                    }
                    // console.dir(response);

                    reject(new Error(`${config.ELECTRON_PDF.SERVICE}: ${response.statusCode} ${response.statusMessage}`));
                });
            });

        });
    }

    /**
     *
     * @param {String} contentHTML
     * @returns {Uint8Array|ArrayBuffer|Buffer|Blob} the zip file
     */
    static makeZip (contentHTML) {
        const zip = JSZip();

        zip.file('index.html',  contentHTML);

        _.forEach(fs.readdirSync(path.join(config.ELECTRON_PDF.SOURCE_FOLDER, 'assets')), (file) =>
        {
            if (file !== 'fonts' && file !== '.DS_Store')
            {
                zip.folder('assets').file(file, fs.readFileSync(path.join(config.ELECTRON_PDF.SOURCE_FOLDER, 'assets', file)));
            }
        });

        _.forEach(fs.readdirSync(path.join(config.ELECTRON_PDF.SOURCE_FOLDER, 'assets/fonts')), (file) =>
        {
            if (file !== '.DS_Store')
            {
                zip.folder('assets').folder('fonts').file(file, fs.readFileSync(path.join(config.ELECTRON_PDF.SOURCE_FOLDER, 'assets/fonts', file)));
            }
        });

        return zip.generate({base64: false, compression: 'DEFLATE'});
    }

    /**
     *
     * @param {string} html
     * @param {string} content
     * @param {object} params
     * @returns {string}
     */
    static replaceStrings (html, content, params) {
        html = html.replace('%%CONTENT%%', content);
        html = html.replace('%%LANG%%', params.lang);

        return html;
    }
}

module.exports = PdfContentRenderer;
