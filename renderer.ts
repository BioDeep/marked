module renderer {

    export function code(code: string, infostring, escaped: boolean): string {
        var lang = (infostring || '').match(/\S*/)[0];

        if (this.options.highlight) {
            var out = this.options.highlight(code, lang);
            if (out != null && out !== code) {
                escaped = true;
                code = out;
            }
        }

        if (!lang) {
            return '<pre><code>'
                + (escaped ? code : helpers.escape.doescape(code, true))
                + '</code></pre>';
        }

        return '<pre><code class="'
            + this.options.langPrefix
            + helpers.escape.doescape(lang, true)
            + '">'
            + (escaped ? code : helpers.escape.doescape(code, true))
            + '</code></pre>\n';
    };

    export function blockquote(quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n';
    };

    export function heading(text: string, level: string, raw: string): string {
        if (this.options.headerIds) {
            return '<h'
                + level
                + ' id="'
                + this.options.headerPrefix
                + raw.toLowerCase().replace(/[^\w]+/g, '-')
                + '">'
                + text
                + '</h'
                + level
                + '>\n';
        }
        // ignore IDs
        return '<h' + level + '>' + text + '</h' + level + '>\n';
    };

    export function hr() {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    };

    export function list(body, ordered, start) {
        var type = ordered ? 'ol' : 'ul',
            startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
    };

    export function listitem(text: string): string {
        return '<li>' + text + '</li>\n';
    };

    export function checkbox(checked) {
        return '<input '
            + (checked ? 'checked="" ' : '')
            + 'disabled="" type="checkbox"'
            + (this.options.xhtml ? ' /' : '')
            + '> ';
    };

    export function paragraph(text) {
        return '<p>' + text + '</p>\n';
    };

    export function table(header, body) {
        if (body) body = '<tbody>' + body + '</tbody>';

        return '<table>\n'
            + '<thead>\n'
            + header
            + '</thead>\n'
            + body
            + '</table>\n';
    };

    export function tablerow(content) {
        return '<tr>\n' + content + '</tr>\n';
    };

    export function tablecell(content, flags) {
        var type = flags.header ? 'th' : 'td';
        var tag = flags.align
            ? '<' + type + ' align="' + flags.align + '">'
            : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
    };

    // span level renderer
    export function strong(text) {
        return '<strong>' + text + '</strong>';
    };

    export function em(text) {
        return '<em>' + text + '</em>';
    };

    export function codespan(text) {
        return '<code>' + text + '</code>';
    };

    export function br() {
        return this.options.xhtml ? '<br/>' : '<br>';
    };

    export function del(text) {
        return '<del>' + text + '</del>';
    };

    export function link(href, title, text) {
        href = helpers.cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
            return text;
        }
        var out = '<a href="' + escape(href) + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
    };

    export function image(href, title, text) {
        href = helpers.cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
            return text;
        }

        var out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
    };
}

interface Renderer {

}