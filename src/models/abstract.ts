namespace markedjs {

    export class Grammer {

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
        br: RegExp;
        em: RegExp;
        del: RegExp;
        escape: RegExp;
        nolink: RegExp;
        strong: RegExp;
        tag: RegExp;
        autolink: RegExp;
        link: RegExp;
        reflink: RegExp;
        url: RegExp;
    }

    export interface IEdits {
        replace(name: string | RegExp, val: RegExp | string): IEdits;
        getRegex(): RegExp;
    }

    export interface Irule {
        fences: RegExp;
        paragraph: RegExp;
        heading: RegExp;
    }

    export interface Itoken {
        type?: string;
        depth?: number;
        text?: string;
        escaped?: boolean;
        lang?: string;
        align?: string[];
        header?: string[];
        cells?: string[];
        ordered?: boolean;
        start?: number;
        loose?: boolean;
        checked?: boolean;
        task?: boolean;
    }
}