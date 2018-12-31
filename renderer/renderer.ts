interface Renderer {

    strong(text: string): string;
    em(text: string): string;
    codespan(text: string): string;
    del(text: string): string;
    text(text: string): string;
    image(href: string, title: string, text: string): string;
    link(href: string, title: string, text: string): string;
    br(): string;
    paragraph(text: string): string;
}