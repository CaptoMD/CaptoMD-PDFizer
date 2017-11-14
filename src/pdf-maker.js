/*
 * Copyright (c) 2017 CaptoMD
 */

const _ = require('lodash');

class PdfMaker {

    /**
     *
     * @param {PdfContentRenderer} contentRenderer
     * @param {PdfShellRenderer} shellRenderer
     */
    constructor (contentRenderer, shellRenderer) {
        if (_.isNil(contentRenderer))
        {
            throw new Error('Bad application setup. Missing PdfContentRenderer.');
        }
        if (_.isNil(shellRenderer))
        {
            throw new Error('Bad application setup. Missing PdfShellRenderer.');
        }

        this.contentRenderer = contentRenderer;
        this.shellRenderer = shellRenderer;
        this.header = '';
        this.content = '';
        this.params = {
            title: '',
            footer: '',
            lang: 'fr',
        };
    }

    /**
     *
     * @param data
     */
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
        this.params.lang = data.lang || 'fr';

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

    /**
     *
     * @return {Promise}
     */
    make () {
        return new Promise((resolve, reject) =>
        {
            console.info('Making the PDF…');

            this.contentRenderer.render(this.content, this.params).then((contentPDF) =>
            {
                this.shellRenderer.render(contentPDF, this.header, this.params).then((finalPDF) =>
                {
                    resolve(finalPDF);

                }).catch((err) =>
                {
                    reject(err);
                });

            }).catch((err) =>
            {
                reject(err);
            });
        });
    }

}

module.exports = PdfMaker;
