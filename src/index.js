/*
 * Copyright (c) 2016 CaptoMD
 */

const port = process.env.PORT || 8400;

const parseArgs = require('minimist');
const argOptions = require('./options');
const server = require('./server');
const PdfMaker = require('./pdf-maker');

const options = parseArgs(process.argv.slice(2), argOptions);

server.use(new PdfMaker(options));
server.start(port);

// process.exit(0);
