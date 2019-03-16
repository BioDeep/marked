interface Renderer {

    options: option;

    strong(text: string): string;
    em(text: string): string;
    codespan(text: string): string;
    code(text: string, lang: string, escaped: boolean): string;
    del(text: string): string;
    text(text: string): string;
    image(href: string, title: string, text: string): string;
    link(href: string, title: string, text: string): string;
    br(): string;
    hr(): string;
    paragraph(text: string): string;
    html(text: string): string;
    heading(text: string, depth: number, unescape: string): string;
    tablerow(cell: string): string;
    tablecell(text: string, opt: { header: boolean, align: string }): string;
    table(thead: string, tbody: string): string;
    blockquote(text: string): string;
    list(body: string, ordered: boolean, start: number): string;
    checkbox(checked: boolean): string;
    listitem(text: string): string;
}