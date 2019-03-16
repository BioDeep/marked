/// <reference path="../models/component.ts" />
/// <reference path="./inlineLexer.ts" />

/**
 * Parsing & Compiling
*/
class parser extends component {

    private renderer: Renderer;
    private tokens: Itoken[];
    private inline: inlineLexer;
    private token: Itoken;

    public constructor(options: option = option.Defaults) {
        super(options);

        this.tokens = [];
        this.token = null;
        this.options.renderer = this.options.renderer || new htmlRenderer();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
    }

    /**
     * Static Parse Method
    */
    public static parse(src, options) {
        var parser = new Parser(options);
        return parser.parse(src);
    }

    /**
     * Parse Loop
    */
    public parse(src: string): string {
        this.inline = new inlineLexer(src.links, this.options);
        // use an InlineLexer with a TextRenderer to extract pure text
        this.inlineText = new inlineLexer(
            src.links,
            <any>helpers.merge({}, this.options, { renderer: new textRenderer() })
        );
        this.tokens = src.reverse();

        var out = '';
        while (this.next()) {
            out += this.tok();
        }

        return out;
    };

    /**
     * Next Token
    */
    public next() {
        return this.token = this.tokens.pop();
    };

    /**
     * Preview Next Token
    */
    public peek() {
        return this.tokens[this.tokens.length - 1] || 0;
    };

    /**
     * Parse Text Tokens
    */
    public parseText() {
        var body = this.token.text;

        while ((<any>this.peek()).type === 'text') {
            body += '\n' + this.next().text;
        }

        return this.inline.output(body);
    };

    /**
     * Parse Current Token
    */
    public tok(): string {
        switch (this.token.type) {
            case 'space': {
                return '';
            }
            case 'hr': {
                return this.renderer.hr();
            }
            case 'heading': {
                return this.renderer.heading(
                    this.inline.output(this.token.text),
                    this.token.depth,
                    unescape(this.inlineText.output(this.token.text)));
            }
            case 'code': {
                return this.renderer.code(this.token.text,
                    this.token.lang,
                    this.token.escaped);
            }
            case 'table': {
                var header = '',
                    body = '',
                    i,
                    row,
                    cell: string = '',
                    j;

                // header         
                for (i = 0; i < this.token.header.length; i++) {
                    cell += this.renderer.tablecell(this.inline.output(this.token.header[i]), { header: true, align: this.token.align[i] });
                }
                header += this.renderer.tablerow(cell);

                for (i = 0; i < this.token.cells.length; i++) {
                    row = this.token.cells[i];

                    cell = '';
                    for (j = 0; j < row.length; j++) {
                        cell += this.renderer.tablecell(
                            this.inline.output(row[j]),
                            { header: false, align: this.token.align[j] }
                        );
                    }

                    body += this.renderer.tablerow(cell);
                }
                return this.renderer.table(header, body);
            }
            case 'blockquote_start': {
                body = '';

                while (this.next().type !== 'blockquote_end') {
                    body += this.tok();
                }

                return this.renderer.blockquote(body);
            }
            case 'list_start': {
                body = '';
                var ordered = this.token.ordered,
                    start = this.token.start;

                while (this.next().type !== 'list_end') {
                    body += this.tok();
                }

                return this.renderer.list(body, ordered, start);
            }
            case 'list_item_start': {
                body = '';
                var loose = this.token.loose;

                if (this.token.task) {
                    body += this.renderer.checkbox(this.token.checked);
                }

                while (this.next().type !== 'list_item_end') {
                    body += !loose && (<any>this.token).type === 'text'
                        ? this.parseText()
                        : this.tok();
                }

                return this.renderer.listitem(body);
            }
            case 'html': {
                // TODO parse inline content if parameter markdown=1
                return this.renderer.html(this.token.text);
            }
            case 'paragraph': {
                return this.renderer.paragraph(this.inline.output(this.token.text));
            }
            case 'text': {
                return this.renderer.paragraph(this.parseText());
            }
            default: {
                var errMsg = 'Token with "' + this.token.type + '" type was not found.';
                if (this.options.silent) {
                    console.log(errMsg);
                } else {
                    throw new Error(errMsg);
                }
            }
        }
    }
}