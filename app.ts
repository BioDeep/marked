﻿/**
 * marked - a markdown parser
 * Copyright (c) 2011-2018, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
*/



/**
 * Marked
 */

function marked(src, opt, callback) {
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
            callback = opt;
            opt = null;
        }

        opt = merge({}, marked.defaults, opt || {});

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

        var done = function (err) {
            if (err) {
                opt.highlight = highlight;
                return callback(err);
            }

            var out;

            try {
                out = Parser.parse(tokens, opt);
            } catch (e) {
                err = e;
            }

            opt.highlight = highlight;

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
        if (opt) opt = merge({}, marked.defaults, opt);
        return Parser.parse(Lexer.lex(src, opt), opt);
    } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if ((opt || marked.defaults).silent) {
            return '<p>An error occurred:</p><pre>'
                + escape(e.message + '', true)
                + '</pre>';
        }
        throw e;
    }
}

/**
 * Options
 */

marked.options =
    marked.setOptions = function (opt) {
        merge(marked.defaults, opt);
        return marked;
    };

marked.getDefaults = function () {
    return {
        baseUrl: null,
        breaks: false,
        gfm: true,
        headerIds: true,
        headerPrefix: '',
        highlight: null,
        langPrefix: 'language-',
        mangle: true,
        pedantic: false,
        renderer: new Renderer(),
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        tables: true,
        xhtml: false
    };
};

marked.defaults = marked.getDefaults();

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;
marked.TextRenderer = TextRenderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
    define(function () { return marked; });
} else {
    root.marked = marked;
}