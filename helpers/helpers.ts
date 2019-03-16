module helpers {

    export function edit(regex: RegExp | string, opt = ''): IEdits {
        regex = (<RegExp>regex).source || regex;

        return <IEdits>{
            replace: function (name: string | RegExp, val: RegExp | string) {
                val = (<RegExp>val).source || val;
                val = (<string>val).replace(/(^|[^\[])\^/g, '$1');
                regex = (<string>regex).replace(name, val);

                return this;
            },
            getRegex: function () {
                return new RegExp(<string>regex, opt);
            }
        };
    }

    export function cleanUrl(sanitize: boolean, base: string, href: string): string {
        if (sanitize) {
            try {
                var prot = decodeURIComponent(unescape(href))
                    .replace(/[^\w:]/g, '')
                    .toLowerCase();
            } catch (e) {
                return null;
            }
            if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
                return null;
            }
        }
        if (base && !originIndependentUrl.test(href)) {
            href = resolveUrl(base, href);
        }
        try {
            href = encodeURI(href).replace(/%25/g, '%');
        } catch (e) {
            return null;
        }
        return href;
    }

    var baseUrls = {};

    export function resolveUrl(base: string, href: string): string {
        if (!baseUrls[' ' + base]) {
            // we can ignore everything in base after the last slash of its path component,
            // but we might need to add _that_
            // https://tools.ietf.org/html/rfc3986#section-3
            if (/^[^:]+:\/*[^/]*$/.test(base)) {
                baseUrls[' ' + base] = base + '/';
            } else {
                baseUrls[' ' + base] = rtrim(base, '/', true);
            }
        }
        base = baseUrls[' ' + base];

        if (href.slice(0, 2) === '//') {
            return base.replace(/:[\s\S]*/, ':') + href;
        } else if (href.charAt(0) === '/') {
            return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href;
        } else {
            return base + href;
        }
    }

    const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

    export function merge(obj: {}, ...args: {}[]) {
        var target, key: string;

        for (var i = 1; i < args.length; i++) {
            target = args[i];

            for (key in target) {
                if (Object.prototype.hasOwnProperty.call(target, key)) {
                    obj[key] = target[key];
                }
            }
        }

        return obj;
    }

    export function splitCells(tableRow: string, count: number): string[] {
        // ensure that every cell-delimiting pipe has a space
        // before it to distinguish it from an escaped pipe
        var row: string = tableRow.replace(/\|/g, function (match, offset, str) {
            var escaped = false, curr = offset;

            while (--curr >= 0 && str[curr] === '\\') {
                escaped = !escaped
            };

            if (escaped) {
                // odd number of slashes means | is escaped
                // so we leave it alone
                return '|';
            } else {
                // add space before unescaped |
                return ' |';
            }
        });
        var cells = row.split(/ \|/)

        if (cells.length > count) {
            cells.splice(count);
        } else {
            while (cells.length < count) cells.push('');
        }

        for (var i: number = 0; i < cells.length; i++) {
            // leading or trailing whitespace is ignored per the gfm spec
            cells[i] = cells[i].trim().replace(/\\\|/g, '|');
        }

        return cells;
    }

    /**
     * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
     * ``/c*$/`` is vulnerable to REDOS.
     * 
     * @param invert Remove suffix of non-c chars instead. Default falsey.
    */
    export function rtrim(str: string, c: string, invert: boolean): string {
        if (str.length === 0) {
            return '';
        }

        // Length of suffix matching the invert condition.
        var suffLen = 0;

        // Step left until we fail to match the invert condition.
        while (suffLen < str.length) {
            var currChar = str.charAt(str.length - suffLen - 1);
            if (currChar === c && !invert) {
                suffLen++;
            } else if (currChar !== c && invert) {
                suffLen++;
            } else {
                break;
            }
        }

        return str.substr(0, str.length - suffLen);
    }
}