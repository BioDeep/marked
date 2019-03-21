module helpers {

    export module escape {

        export const escapeTest = /[&<>"']/;
        export const escapeReplace = /[&<>"']/g;
        export const replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        export const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
        export const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;

        export function doescape(html: string, encode: boolean): string {           
            if (encode) {
                if (escapeTest.test(html)) {
                    return html.replace(escapeReplace, ch => replacements[ch]);
                }
            } else {
                if (escapeTestNoEncode.test(html)) {
                    return html.replace(escapeReplaceNoEncode, ch => replacements[ch]);
                }
            }

            return html;
        }

        /**
         * explicitly match decimal, hex, and named HTML entities
        */
        export function unescape(html: string): string {
            return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, function (_, n) {
                n = n.toLowerCase();
                if (n === 'colon') return ':';
                if (n.charAt(0) === '#') {
                    return n.charAt(1) === 'x'
                        ? String.fromCharCode(parseInt(n.substring(2), 16))
                        : String.fromCharCode(+n.substring(1));
                }
                return '';
            });
        }
    }
}