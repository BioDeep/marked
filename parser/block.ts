/// <reference path="../models/abstract.ts" />

/**
 * Block-Level Grammar
*/
class block extends Grammer {

    _label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
    _title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;

    _tag = 'address|article|aside|base|basefont|blockquote|body|caption'
        + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
        + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
        + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
        + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
        + '|track|ul';

    public static _comment = /<!--(?!-?>)[\s\S]*?-->/;
    public static bullet = /(?:[*+-]|\d{1,9}\.)/;

    item: RegExp;

    /**
     * Normal Block Grammar
    */
    normal: block;

    /**
     * GFM Block Grammar
     */
    gfm: block;

    /**
     * GFM + Tables Block Grammar
     */

    tables: block;

    /**
     * Pedantic grammar
     */
    pedantic: block;

    public constructor() {
        super();

        // base class initialize
        this.newline = /^\n+/;
        this.code = /^( {4}[^\n]+\n*)+/;
        this.fences = <any>helpers.noop;
        this.hr = /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/;
        this.heading = /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/;
        this.nptable = <any>helpers.noop;
        this.blockquote = /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/;
        this.list = /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/;
        this.html = new RegExp(block.blockHtml());
        this.def = /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/;
        this.table = <any>helpers.noop;
        this.lheading = /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/;
        this.paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading| {0,3}>|<\/?(?:tag)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)/;
        this.text = /^[^\n]+/;

        // edit and modify from base
        this.def = helpers.edit(this.def)
            .replace('label', this._label)
            .replace('title', this._title)
            .getRegex();

        this.list = helpers.edit(this.list)
            .replace(/bull/g, block.bullet)
            .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
            .replace('def', '\\n+(?=' + this.def.source + ')')
            .getRegex();

        this.item = helpers.edit(/^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/, 'gm')
            .replace(/bull/g, block.bullet)
            .getRegex();

        this.html = helpers.edit(this.html, 'i')
            .replace('comment', block._comment)
            .replace('tag', this._tag)
            .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
            .getRegex();

        this.paragraph = helpers.edit(this.paragraph)
            .replace('hr', this.hr)
            .replace('heading', this.heading)
            .replace('lheading', this.lheading)
            .replace('tag', this._tag) // pars can be interrupted by type (6) html blocks
            .getRegex();

        this.blockquote = helpers.edit(this.blockquote)
            .replace('paragraph', this.paragraph)
            .getRegex();

        var vm = this;

        this.normal = <any>helpers.merge({}, vm);
        this.gfm = <any>(function () {
            var rule: Irule = <any>helpers.merge({}, vm.normal, {
                fences: /^ {0,3}(`{3,}|~{3,})([^`\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
                paragraph: /^/,
                heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
            });

            rule.paragraph = helpers.edit(rule.paragraph)
                .replace('(?!', '(?!'
                    + rule.fences.source.replace('\\1', '\\2') + '|'
                    + vm.list.source.replace('\\1', '\\3') + '|')
                .getRegex();

            return rule
        })();

        this.tables = <any>helpers.merge({}, this.gfm, {
            nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
            table: /^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/
        });

        this.pedantic = <any>helpers.merge({}, this.normal, {
            html: helpers.edit(
                '^ *(?:comment *(?:\\n|\\s*$)'
                + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
                + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
                .replace('comment', block._comment)
                .replace(/tag/g, '(?!(?:'
                    + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
                    + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
                    + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
                .getRegex(),
            def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/
        });
    }

    private static blockHtml(): string {
        return '^ {0,3}(?:' // optional indentation
            + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
            + '|comment[^\\n]*(\\n+|$)' // (2)
            + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
            + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
            + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
            + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
            + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
            + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
            + ')';
    }
}