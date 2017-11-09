/*
 * Copyright (c) 2016 CaptoMD
 */

const _ = require('lodash');
const moment = require('moment');

class PdfMaker {
    constructor (options) {
        this.options = options || {};
        this.header = '';
        this.content = '';
        this.params = {
            title: '',
            formID: '',
            authorL: '',
            footer: '',
        };
    }

    setParams (data) {
        if (_.isNil(data.content))
        {
            throw new Error('Missing content');
        }

        if (_.isNil(data.header))
        {
            throw new Error('Missing header');
        }

        this.header = data.header || null;
        this.content = data.content || null;
        this.params.title = data.title || 'Sans titre';
        this.params.formID = data.form_id || 'AA0000';
        this.params.author = data.author || 'Imprimé par :';

        let footer = data.footer || ['', 'DIC : 3-4-4'];
        if (_.isString(footer))
        {
            footer = footer.replace(/(<br>|<br \/>|\n)/i, '|');
            footer = footer.split('|');
        }
        if (_.isArray(footer))
        {
            if (footer.length === 1)
            {
                footer.unshift('');
            }
        }
        this.params.footer = footer;
    }

    make (callback) {
        const timestamp = moment().format('YYYY-MM-DD hh:mm:ss');
        console.log(timestamp);

        if (_.isFunction(callback))
        {
            callback.call(this, 'DONE: ' + timestamp);
        }
    }
}

module.exports = PdfMaker;
