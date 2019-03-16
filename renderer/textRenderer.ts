/**
 * returns only the textual part of the token
 * no need for block level renderers
*/
class textRenderer implements Renderer {

    options: option;

    code(text: string, lang: string, escaped: boolean): string {
        throw new Error("Method not implemented.");
    }
    hr(): string {
        throw new Error("Method not implemented.");
    }
    html(text: string): string {
        throw new Error("Method not implemented.");
    }
    heading(text: string, depth: number, unescape: string): string {
        throw new Error("Method not implemented.");
    }
    tablerow(cell: string): string {
        throw new Error("Method not implemented.");
    }
    tablecell(text: string, opt: { header: boolean; align: string; }): string {
        throw new Error("Method not implemented.");
    }
    table(thead: string, tbody: string): string {
        throw new Error("Method not implemented.");
    }
    blockquote(text: string): string {
        throw new Error("Method not implemented.");
    }
    list(body: string, ordered: boolean, start: number): string {
        throw new Error("Method not implemented.");
    }
    checkbox(checked: boolean): string {
        throw new Error("Method not implemented.");
    }
    listitem(text: string): string {
        throw new Error("Method not implemented.");
    }

    public paragraph(text: string): string {
        return text + "\n";
    }

    public strong(text: string): string {
        return text;
    }

    public em(text: string): string {
        return text;
    }
    public codespan(text: string): string {
        return text;
    }
    public del(text: string): string {
        return text;
    }
    public text(text: string): string {
        return text;
    }

    public image(href: string, title: string, text: string): string {
        return '' + text;
    };

    public link(href: string, title: string, text: string): string {
        return '' + text;
    };

    public br(): string {
        return '';
    };
}