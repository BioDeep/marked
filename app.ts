/**
 * marked - a markdown parser
 * Copyright (c) 2011-2018, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
*/
const marked: Imarked = (function () {

    let marked: Imarked = <any>function marked(src: string, opt?: option | markedCallback, callback?: markedCallback) {
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
                callback = <markedCallback>opt;
                opt = null;
            }

            opt = <option>helpers.merge({}, option.Defaults, opt || {});

            var highlight = opt.highlight,
                tokens,
                pending,
                i = 0;

            try {
                tokens = Lexer.lex(src, opt);
            } catch (e) {
                return callback(e);
            }

            pending = tokens.length;

            var done = function (err?: string) {
                if (err) {
                    (<option>opt).highlight = highlight;
                    return callback(err);
                }

                var out: string;

                try {
                    out = Parser.parse(tokens, opt);
                } catch (e) {
                    err = e;
                }

                (<option>opt).highlight = highlight;

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
                (function (token) {
                    if (token.type !== 'code') {
                        return --pending || done();
                    }
                    return highlight(token.text, token.lang, function (err, code) {
                        if (err) return done(err);
                        if (code == null || code === token.text) {
                            return --pending || done();
                        }
                        token.text = code;
                        token.escaped = true;
                        --pending || done();
                    });
                })(tokens[i]);
            }

            return;
        }
        try {
            if (opt) opt = <option>helpers.merge({}, option.Defaults, opt);
            return Parser.parse(Lexer.lex(src, opt), opt);
        } catch (e) {
            e.message += '\nPlease report this to https://github.com/markedjs/marked.';
            if ((opt || option.Defaults).silent) {
                return '<p>An error occurred:</p><pre>'
                    + helpers.escape.doescape(e.message + '', true)
                    + '</pre>';
            }
            throw e;
        }
    }

    return marked;
})();


