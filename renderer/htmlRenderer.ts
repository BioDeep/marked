class htmlRenderer extends component implements Renderer {

    public constructor() {
        super(null);
    }

    html(text: string): string {
        return text;
    }

    public text(text: string): string {
        // return `<pre>${text}</pre>`;
        return text;
    }

    public code(code: string, infostring: string, escaped: boolean): string {
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

    public blockquote(quote: string): string {
        return '<blockquote>\n' + quote + '</blockquote>\n';
    };

    public heading(text: string, level: number, raw: string): string {
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

    public hr(): string {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    };

    public list(body: string, ordered: boolean, start: number): string {
        var type = ordered ? 'ol' : 'ul',
            startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
    };

    public listitem(text: string): string {
        return '<li>' + text + '</li>\n';
    };

    public checkbox(checked: boolean): string {
        return '<input '
            + (checked ? 'checked="" ' : '')
            + 'disabled="" type="checkbox"'
            + (this.options.xhtml ? ' /' : '')
            + '> ';
    };

    public paragraph(text: string): string {
        return '<p>' + text + '</p>\n';
    };

    public table(header: string, body: string) {
        if (body) body = '<tbody>' + body + '</tbody>';

        return '<table>\n'
            + '<thead>\n'
            + header
            + '</thead>\n'
            + body
            + '</table>\n';
    };

    public tablerow(content: string): string {
        return '<tr>\n' + content + '</tr>\n';
    };

    public tablecell(content: string, flags: { header: boolean, align: string }): string {
        var type = flags.header ? 'th' : 'td';
        var tag = flags.align
            ? '<' + type + ' align="' + flags.align + '">'
            : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
    };

    // span level renderer
    public strong(text: string): string {
        return '<strong>' + text + '</strong>';
    };

    public em(text: string): string {
        return '<em>' + text + '</em>';
    };

    public codespan(text: string): string {
        return '<code>' + text + '</code>';
    };

    public br(): string {
        return this.options.xhtml ? '<br/>' : '<br>';
    };

    public del(text: string): string {
        return '<del>' + text + '</del>';
    };

    public link(href: string, title: string, text: string): string {
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

    public static hrefSolver: (href: string) => string;

    public image(href: string, title: string, text: string): string {
        href = helpers.cleanUrl(this.options.sanitize, this.options.baseUrl, href);

        if (href === null) {
            return text;
        } else if (htmlRenderer.hrefSolver && htmlRenderer.hrefSolver != undefined) {
            href = htmlRenderer.hrefSolver(href);
        }

        var out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
    };
}