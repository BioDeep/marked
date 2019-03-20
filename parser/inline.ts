
/**
 * Inline-Level Grammar
*/
class inline extends Grammer {

    // list of punctuation marks from common mark spec
    // without ` and ] to workaround Rule 17 (inline code blocks/links)
    _punctuation = '!"#$%&\'()*+,\\-./:;<=>?@\\[^_{|}~';
    _escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
    _scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
    _email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
    _attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
    _label = /(?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|[^\[\]\\])*?/;
    _href = /\s*(<(?:\\[<>]?|[^\s<>\\])*>|(?:\\[()]?|\([^\s\x00-\x1f\\]*\)|[^\s\x00-\x1f()\\])*?)/;
    _title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

    /**
     * Normal Inline Grammar
    */
    normal: inline;
    /**
     * Pedantic Inline Grammar
    */
    pedantic: inline;
    /**
     * GFM Inline Grammar
    */
    gfm: inline;
    /**
     * GFM + Line Breaks Inline Grammar
    */
    breaks: inline;

    public constructor() {
        super();

        // base class initialize
        this.escape = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
        this.autolink = /^<(scheme:[^\s\x00-\x1f<>]*|email)>/;
        this.url = <any>helpers.noop;
        this.tag = new RegExp(inline.inlineTag());
        this.link = /^!?\[(label)\]\(href(?:\s+(title))?\s*\)/;
        this.reflink = /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/;
        this.nolink = /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/;
        this.strong = /^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/;
        this.em = /^_([^\s_])_(?!_)|^\*([^\s*"<\[])\*(?!\*)|^_([^\s][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s"<\[][\s\S]*?[^\s*])\*(?!\*)|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/;
        this.code = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
        this.br = /^( {2,}|\\)\n(?!\s*$)/;
        this.del = <any>helpers.noop;
        this.text = /^(`+|[^`])[\s\S]*?(?=[\\<!\[`*]|\b_| {2,}\n|$)/;

        // edits and modify
        this.em = helpers.edit(this.em).replace(/punctuation/g, this._punctuation).getRegex();
        this.autolink = helpers.edit(this.autolink)
            .replace('scheme', this._scheme)
            .replace('email', this._email)
            .getRegex();

        this.tag = helpers.edit(this.tag)
            .replace('comment', block._comment)
            .replace('attribute', this._attribute)
            .getRegex();

        this.link = helpers.edit(this.link)
            .replace('label', this._label)
            .replace('href', this._href)
            .replace('title', this._title)
            .getRegex();

        this.reflink = helpers.edit(this.reflink)
            .replace('label', this._label)
            .getRegex();

        var vm = this;

        this.normal = <any>helpers.merge({}, this);
        this.pedantic = <any>helpers.merge({}, this.normal, {
            strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
            em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
            link: helpers.edit(/^!?\[(label)\]\((.*?)\)/)
                .replace('label', vm._label)
                .getRegex(),
            reflink: helpers.edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
                .replace('label', vm._label)
                .getRegex()
        });
        this.gfm = <any>helpers.merge({}, this.normal, {
            escape: helpers.edit(vm.escape).replace('])', '~|])').getRegex(),
            _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
            url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
            _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
            del: /^~+(?=\S)([\s\S]*?\S)~+/,
            text: helpers.edit(vm.text)
                .replace(']|', '~]|')
                .replace('|$', '|https?://|ftp://|www\\.|[a-zA-Z0-9.!#$%&\'*+/=?^_`{\\|}~-]+@|$')
                .getRegex()
        });
        this.gfm.url = helpers.edit(this.gfm.url, 'i')
            .replace('email', (<any>this.gfm)._extended_email)
            .getRegex();
        this.breaks = <any>helpers.merge({}, this.gfm, {
            br: helpers.edit(vm.br).replace('{2,}', '*').getRegex(),
            text: helpers.edit(vm.gfm.text).replace('{2,}', '*').getRegex()
        });
    }

    private static inlineTag() {
        return '^comment'
            + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
            + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
            + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
            + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
            + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'; // CDATA section
    }
}