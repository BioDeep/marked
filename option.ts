class option {

    baseUrl: string;
    breaks: boolean;
    gfm: boolean;
    headerIds: boolean;
    headerPrefix: string;
    highlight: (code: string, lang: string, callback?: highlightCallback) => string;
    langPrefix: string;
    mangle: boolean;
    pedantic: boolean;
    renderer: Renderer;
    sanitize: boolean;
    sanitizer?: (text: string) => string;
    silent: boolean;
    smartLists: boolean;
    smartypants: boolean;
    tables: boolean;
    xhtml: boolean;

    block: block;
    inline: inline;

    public static get Defaults(): option {
        return <option>{
            baseUrl: null,
            breaks: false,
            gfm: true,
            headerIds: true,
            headerPrefix: '',
            highlight: null,
            langPrefix: 'language-',
            mangle: true,
            pedantic: false,
            renderer: null, // new Renderer(),
            sanitize: false,
            sanitizer: null,
            silent: false,
            smartLists: false,
            smartypants: false,
            tables: true,
            xhtml: false,

            // grammers
            inline: new inline(),
            block: new block()
        };
    }
}

interface highlightCallback {
    (err: string, code: number | string): void;
}