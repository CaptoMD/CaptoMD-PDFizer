/*
 * Copyright (c) 2017 CaptoMD
 */


const server = require('./server');
const PdfMaker = require('./pdf-maker');
const PdfContentRenderer = require('./pdf-content-renderer');
const PdfShellRenderer = require('./pdf-shell-renderer');
const config = require('./config');

const PORT = process.env.PDFIZER_SERVICE_PORT || config.PORT || 9440;

const pdfMaker = new PdfMaker(new PdfContentRenderer,
                              new PdfShellRenderer);

server.use(pdfMaker);
server.start(PORT);
