interface Imarked {
    (src: string, opt: option, callback: markedCallback);

    options: option;
    defaults: option;

    Parser: parser
    Renderer: Renderer;
    TextRenderer: textRenderer;

    lexer: Lexer;
    inlineLexer: inlineLexer;

    parse: Imarked;
}

interface markedCallback {
    (err: string, output?: string): void;
}