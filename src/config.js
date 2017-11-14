/*
 * Copyright (c) 2017 CaptoMD
 */

const config = {
    PDF_REACTOR: {
        SERVICE: 'http://localhost:9423/service/rest/convert.pdf',
        SOURCE_FOLDER: 'src/assets/shell',
    },
    ELECTRON_PDF: {
        SERVICE: 'http://localhost:9645/',
        SOURCE_FOLDER: 'src/assets/content',
    },
    DEBUG_MODE: true,
    TMP_FOLDER: 'tmp',
};

module.exports = config;
