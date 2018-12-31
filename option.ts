class option {

    baseUrl: string;
    breaks: boolean;
    gfm: boolean;
    headerIds: boolean;
    headerPrefix: string;
    highlight: (code: string, lang: string) => string;
    langPrefix: string;
    mangle: boolean;
    pedantic: boolean;
    renderer: Renderer;
    sanitize: boolean;
    sanitizer: boolean;
    silent: boolean;
    smartLists: boolean;
    smartypants: boolean;
    tables: boolean;
    xhtml: boolean;

    public get Defaults(): option {
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
            xhtml: false
        };
    }
}