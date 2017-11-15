/*
 * Copyright (c) 2017 CaptoMD
 */

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');

const fs = require('fs');
const path = require('path');

class Server {

    /**
     *
     */
    constructor () {
        this.maker = null;
        this.app = null;

        this.init();
    }

    /**
     *
     */
    init () {
        this.app = express();
        this.app.use(bodyParser.json({limit: '5mb'}));
        this.app.disable('x-powered-by');

        // Catch-all middleware:
        this.app.use((req, res, next) =>
        {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, Content-Type');

            if (req.method === 'OPTIONS')
            {
                res.send([]);
                return;
            }

            if (req.method !== 'POST')
            {
                Server.sendError(405, new Error(`Method ${req.method} Not Allowed`), req, res);
            }

            if (req.path !== '/')
            {
                Server.sendError(401, new Error(`Not Found`), req, res);
            }

            next();
        });

        // Main route:
        this.app.post('/', (req, res) =>
        {
            console.info('Receiving data.');
            this.maker.setParams(req.body);

            this.maker.make().then((finalPDF) =>
            {
                const outputFile = path.join(config.TMP_FOLDER, 'final.pdf');
                fs.writeFile(outputFile, finalPDF, (err) =>
                {
                    if (err)
                    {
                        console.error(err);
                        return;
                    }

                    console.log(`Final PDF! ${outputFile}`);

                    res.download(outputFile, 'final.pdf', () =>
                    {
                        // Successfully downloaded. Delete working files:
                        console.log('Download succeeded!');
                        // fs.unlink(outputFile, (ulErr) => {
                        //     if (ulErr)
                        //     {
                        //         console.error(ulErr);
                        //         return;
                        //     }
                        //     console.log(`File ${outputFile} deleted`);
                        // });
                    });
                });

            }).catch((reason) =>
            {
                console.error(reason);
                Server.sendError(500, new Error(reason), req, res);
            });
        });

        // Error-handling middleware (always takes four arguments):
        this.app.use((err, req, res, next) => {
            const status = 400;
            Server.sendError(status, err, req, res);
        });
    }

    /**
     *
     * @param {int} status
     * @param {Error} err
     * @param req
     * @param res
     */
    static sendError (status, err, req, res)
    {
        const userAgent = req.header('user-agent');
        const requester = `[${req.method}] ${req.protocol}://${req.header('host')}${req.url}`;
        // Error as message:
        const message = err.message;
        // Log with color inverted:
        console.error('\x1b[37m\x1b[41m%s\x1b[0m%s', `Erreur: ${message}\nClient: ${requester}`, ` ${userAgent}`);
        if (config.DEBUG_MODE)
        {
            console.error(err.stack);
        }

        res.status(status).send({error: true, message, request: requester, userAgent});
    }

    /**
     *
     * @param {PdfMaker} maker
     */
    use (maker) {
        this.maker = maker;
    }

    /**
     *
     * @param {int} port
     */
    start (port) {
        if (this.app && !_.isNil(this.maker))
        {
            this.app.listen(port, () => {
                console.info(`Listening on port ${port} …`);

                if (config.DEBUG_MODE)
                {
                    console.log('config :');
                    console.log(JSON.stringify(config, null, '  '));
                }
            });
        }
    }
}

module.exports = new Server;
