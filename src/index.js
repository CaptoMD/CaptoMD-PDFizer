/*
 * Copyright (c) 2017 CaptoMD
 */

const port = process.env.PORT || 8400;

const server = require('./server');
const PdfMaker = require('./pdf-maker');
const PdfContentRenderer = require('./pdf-content-renderer');
const PdfShellRenderer = require('./pdf-shell-renderer');

const pdfMaker = new PdfMaker(new PdfContentRenderer,
                              new PdfShellRenderer);

server.use(pdfMaker);
server.start(port);
