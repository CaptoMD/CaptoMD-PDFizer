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

class PdfShellRenderer {

    /**
     *
     * @param {Buffer} contentPDF
     * @param header
     * @param params
     * @returns {Promise}
     */
    render (contentPDF, header, params) {

        return new Promise((resolve, reject) =>
        {
            const uuid = uuidv4();
            const tempZipFile = path.join(config.TMP_FOLDER, `${uuid}.zip`);

            try
            {
                let template = fs.readFileSync(path.join(config.PDF_REACTOR.SOURCE_FOLDER, 'template.html'), 'utf8');
                template = PdfShellRenderer.replaceStrings(template, header, params);
                // console.log(template);

                // ZIP Asset Packages:
                const zipped = PdfShellRenderer.makeZip(contentPDF, template);
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
                    url: process.env.PDF_REACTOR_SERVICE_URL || config.PDF_REACTOR.SERVICE,
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
                        console.log(`PdfShellRenderer response: ${response.statusCode} ${response.statusMessage}`);
                    }

                    if (response.statusCode == 200)
                    {
                        resolve(body);
                        return;
                    }

                    reject(new Error(`${config.PDF_REACTOR.SERVICE}: ${response.statusCode} ${response.statusMessage}`));
                });
            });

        });
    }

    /**
     *
     * @param contentPDF
     * @param {String} shellHTML
     * @returns {Uint8Array|ArrayBuffer|Buffer|Blob}
     */
    static makeZip (contentPDF, shellHTML) {
        const zip = JSZip();

        zip.file('configuration.json', fs.readFileSync(path.join(config.PDF_REACTOR.SOURCE_FOLDER, 'configuration.json'), 'utf8'));
        zip.file('shell.html',  shellHTML);
        zip.file('content.pdf', contentPDF);

        _.forEach(fs.readdirSync(path.join(config.PDF_REACTOR.SOURCE_FOLDER, 'assets')), (file) =>
        {
            if (file !== 'fonts' && file !== '.DS_Store')
            {
                zip.folder('assets').file(file, fs.readFileSync(path.join(config.PDF_REACTOR.SOURCE_FOLDER, 'assets', file)));
            }
        });

        _.forEach(fs.readdirSync(path.join(config.PDF_REACTOR.SOURCE_FOLDER, 'assets/fonts')), (file) =>
        {
            if (file !== '.DS_Store')
            {
                zip.folder('assets').folder('fonts').file(file, fs.readFileSync(path.join(config.PDF_REACTOR.SOURCE_FOLDER, 'assets/fonts', file)));
            }
        });

        return zip.generate({base64: false, compression: 'DEFLATE'});
    }

    /**
     *
     * @param {string} html
     * @param {string} header
     * @param {object} params
     * @returns {string}
     */
    static replaceStrings (html, header, params) {
        html = html.replace('%%HEADER%%', header);
        html = html.replace('%%LANG%%', params.lang);
        html = html.replace('%%FOOTER_HIGHER%%', params.footer[0]);
        html = html.replace('%%FOOTER_LOWER%%', params.footer[1]);
        html = html.replace('%%TITLE%%', params.title);

        return html;
    }

}

module.exports = PdfShellRenderer;
