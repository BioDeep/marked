class Grammer {

    newline: RegExp;
    code: RegExp;
    fences: RegExp;
    hr: RegExp;
    heading: RegExp;
    nptable: RegExp;
    blockquote: RegExp;
    list: RegExp;
    html: RegExp;
    def: RegExp;
    table: RegExp;
    lheading: RegExp;
    paragraph: RegExp;
    text: RegExp;

}

interface IEdits {
    replace(name: string | RegExp, val: RegExp | string): IEdits;
    getRegex(): RegExp;
}