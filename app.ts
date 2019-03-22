/// <reference path="./option.ts" />
/// <reference path="./helpers/escape.ts" />
/// <reference path="./helpers/helpers.ts" />
/// <reference path="./parser/block.ts" />
/// <reference path="./parser/inline.ts" />
/// <reference path="./parser/inlineLexer.ts" />
/// <reference path="./parser/lexer.ts" />
/// <reference path="./parser/parser.ts" />

/**
 * marked - a markdown parser
 * Copyright (c) 2011-2018, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
*/
const marked: markedjs.Imarked = (function () {

    let markedCallback = function (src: string, opt: markedjs.option, callback: markedjs.markedCallback) {
        var highlight = opt.highlight,
            tokens: markedjs.Itoken[],
            pending: number,
            i = 0;

        try {
            tokens = new markedjs.Lexer(opt).lex(src);
        } catch (e) {
            return callback(e);
        }

        pending = tokens.length;

        var done = function (err: string = null) {
            if (err) {
                (<markedjs.option>opt).highlight = highlight;
                return callback(err);
            }

            var out: string;

            try {
                out = new markedjs.parser(<markedjs.option>opt).parse(tokens);
            } catch (e) {
                err = e;
            }

            (<markedjs.option>opt).highlight = highlight;

            return err
                ? callback(err)
                : callback(null, out);
        };

        if (!highlight || highlight.length < 3) {
            return done();
        }

        delete opt.highlight;

        if (!pending) return done();

        for (; i < tokens.length; i++) {
            (function (token: markedjs.Itoken) {
                if (token.type !== 'code') {
                    return --pending || done();
                }
                return highlight(token.text, token.lang, function (err, code) {
                    if (err) return done(err);
                    if (code == null || code === token.text) {
                        return --pending || done();
                    }
                    token.text = <string>code;
                    token.escaped = true;
                    --pending || done();
                });
            })(tokens[i]);
        }
    }

    let marked: markedjs.Imarked = <any>function marked(src: string,
        opt: markedjs.option | markedjs.markedCallback = markedjs.option.Defaults,
        callback: markedjs.markedCallback = null): string {

        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
            throw new Error('marked(): input parameter is undefined or null');
        }
        if (typeof src !== 'string') {
            throw new Error('marked(): input parameter is of type '
                + Object.prototype.toString.call(src) + ', string expected');
        }

        if (callback || typeof opt === 'function') {
            if (!callback) {
                callback = <markedjs.markedCallback>opt;
                opt = null;
            }

            opt = <markedjs.option>markedjs.helpers.merge({}, markedjs.option.Defaults, opt || {});
            markedCallback(src, opt, callback);
        } else {
            try {
                if (opt) opt = <markedjs.option>markedjs.helpers.merge({}, markedjs.option.Defaults, opt);

                let lexer = new markedjs.Lexer(opt)
                let tokens = lexer.lex(src);
                let mdparser = new markedjs.parser(opt);

                return mdparser.parse(tokens);
            } catch (e) {
                e.message += '\nPlease report this to https://github.com/markedjs/marked.';

                if ((opt || markedjs.option.Defaults).silent) {
                    return '<p>An error occurred:</p><pre>'
                        + markedjs.helpers.escape.doescape(e.message + '', true)
                        + '</pre>';
                }

                throw e;
            }
        }
    }

    return marked;
})();


