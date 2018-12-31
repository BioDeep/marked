/**
 * returns only the textual part of the token
 * no need for block level renderers
*/
class textRenderer implements Renderer {

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