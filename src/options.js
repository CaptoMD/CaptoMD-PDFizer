/*
 * Copyright (c) 2016 CaptoMD
 */

const options = {
    booleans: ['printBackground', 'waitForJSEvent'],
    alias: {
        'input': 'i',
        'output': 'o',

        'browserConfig': [],
        'cookie': ['cookies'],
        'css': 'c',
        'disableCache': 'd',
        'help': 'h',
        'landscape': 'l',
        'marginsType': ['m', 'marginType'],
        'orientation': ['o', 'orientations'],
        'outputWait': 'w',
        'printBackground': 'b',
        'version': 'v',
        'waitForJSEvent': 'e'
    },
    default: {
        'marginsType': 1,
        'outputWait': 0,
        'printBackground': true,
        'waitForJSEvent': true
    }
};

module.exports = options;
