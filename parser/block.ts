
/**
 * Block-Level Grammar
*/
module block {

    const block = {
        newline: /^\n+/,
        code: /^( {4}[^\n]+\n*)+/,
        fences: helpers.noop,
        hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
        heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
        nptable: noop,
        blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
        list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
        html: '^ {0,3}(?:' // optional indentation
            + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
            + '|comment[^\\n]*(\\n+|$)' // (2)
            + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
            + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
            + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
            + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
            + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
            + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
            + ')',
        def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
        table: noop,
        lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
        paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading| {0,3}>|<\/?(?:tag)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)/,
        text: /^[^\n]+/
    };
       
    export const _label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
    export const _title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
    export const def = helpers.edit(block.def)
        .replace('label', _label)
        .replace('title', _title)
        .getRegex();

    export const bullet = /(?:[*+-]|\d{1,9}\.)/;
    export const item = helpers.edit(/^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/, 'gm')
        .replace(/bull/g, bullet)
        .getRegex();

    export const list = helpers.edit(block.list)
        .replace(/bull/g, bullet)
        .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
        .replace('def', '\\n+(?=' + block.def.source + ')')
        .getRegex();

    export const _tag = 'address|article|aside|base|basefont|blockquote|body|caption'
        + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
        + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
        + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
        + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
        + '|track|ul';
    export const _comment = /<!--(?!-?>)[\s\S]*?-->/;
    export const html = helpers.edit(block.html, 'i')
        .replace('comment', _comment)
        .replace('tag', _tag)
        .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
        .getRegex();

    export const paragraph = helpers.edit(block.paragraph)
        .replace('hr', block.hr)
        .replace('heading', block.heading)
        .replace('lheading', block.lheading)
        .replace('tag', _tag) // pars can be interrupted by type (6) html blocks
        .getRegex();

    export const blockquote = helpers.edit(block.blockquote)
        .replace('paragraph', block.paragraph)
        .getRegex();

    /**
     * Normal Block Grammar
     */

    export function normal() {
        return helpers.merge({}, block)
    };

    /**
     * GFM Block Grammar
     */

    export function gfm() {
        var rule = helpers.merge({}, normal, {
            fences: /^ {0,3}(`{3,}|~{3,})([^`\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
            paragraph: /^/,
            heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
        });

        rule.paragraph = helpers.edit(block.paragraph)
            .replace('(?!', '(?!'
                + rule.fences.source.replace('\\1', '\\2') + '|'
                + block.list.source.replace('\\1', '\\3') + '|')
            .getRegex();

        return rule
    } 

    /**
     * GFM + Tables Block Grammar
     */

    export function tables() {
        return helpers.merge({}, gfm, {
            nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
            table: /^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/
        });
    }

    /**
     * Pedantic grammar
     */

    export function pedantic() {
        return helpers.merge({}, normal, {
            html: helpers.edit(
                '^ *(?:comment *(?:\\n|\\s*$)'
                + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
                + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
                .replace('comment', _comment)
                .replace(/tag/g, '(?!(?:'
                    + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
                    + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
                    + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
                .getRegex(),
            def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/
        });
    } 
}