/*
 * Copyright (c) 2016 CaptoMD
 */
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

class Server {
    constructor () {
        this.maker = null;
        this.app = null;

        this.init();
    }

    init () {
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.disable('x-powered-by');

        this.app.post('/', (req, res) =>
        {
            try
            {
                this.maker.setParams(req.body);
                console.info('Receiving data. Making the PDF…');
                this.maker.make((destination) =>
                {
                    const out = {
                        destination,
                        header: this.maker.header,
                        content: this.maker.content,
                        params: this.maker.params,
                    };
                    res.send(out);
                });
            }
            catch (err)
            {
                this.sendError(err, res);
            }
        });

        // Error page:
        this.app.use((err, req, res) => {
            console.error(err);
            res.status(500).send(String(err));
        });
    }

    sendError (err, res) {
        console.error(err);
        res.status(500).send(String(err));
    }

    use (maker) {
        this.maker = maker;
    }

    start (port) {
        if (!_.isNil(this.maker))
        {
            this.app.listen(port, () => {
                console.info(`Listening port on ${port}.`);
            });
        }
    }
}

module.exports = new Server;
