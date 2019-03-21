﻿
/**
 * Block Lexer
*/
class Lexer {

    private tokens: Itoken[];
    private rules: block;

    public constructor(private options: option) {
        let block = options.block;

        this.tokens = [];
        (<any>this.tokens).links = Object.create(null);
        this.rules = options.block.normal;

        if (this.options.pedantic) {
            this.rules = block.pedantic;
        } else if (this.options.gfm) {
            if (this.options.tables) {
                this.rules = block.tables;
            } else {
                this.rules = block.gfm;
            }
        }
    }

    /**
     * Preprocessing
    */
    public lex(src: string): Itoken[] {
        src = src
            .replace(/\r\n|\r/g, '\n')
            .replace(/\t/g, '    ')
            .replace(/\u00a0/g, ' ')
            .replace(/\u2424/g, '\n');

        return this.token(src, true);
    };

    /**
     * Lexing
    */
    public token(src: string, top) {
        src = src.replace(/^ +$/gm, '');
        var next,
            loose,
            cap: RegExpExecArray | string | RegExpMatchArray,
            bull,
            b,
            item,
            listStart,
            listItems,
            t,
            space,
            i,
            tag,
            l,
            isordered,
            istask,
            ischecked;

        while (src) {
            // newline
            if (cap = this.rules.newline.exec(src)) {
                src = src.substring(cap[0].length);
                if (cap[0].length > 1) {
                    this.tokens.push(<Itoken>{
                        type: 'space'
                    });
                }
            }

            // code
            if (cap = this.rules.code.exec(src)) {
                src = src.substring(cap[0].length);
                cap = cap[0].replace(/^ {4}/gm, '');
                this.tokens.push(<Itoken>{
                    type: 'code',
                    text: !this.options.pedantic
                        ? helpers.rtrim(cap, '\n')
                        : cap
                });
                continue;
            }

            // fences (gfm)
            if (cap = this.rules.fences.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push(<Itoken>{
                    type: 'code',
                    lang: cap[2] ? cap[2].trim() : cap[2],
                    text: cap[3] || ''
                });
                continue;
            }

            // heading
            if (cap = this.rules.heading.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push(<Itoken>{
                    type: 'heading',
                    depth: cap[1].length,
                    text: cap[2]
                });
                continue;
            }

            // table no leading pipe (gfm)
            if (top && (cap = this.rules.nptable.exec(src))) {
                item = {
                    type: 'table',
                    header: helpers.splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
                    align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                    cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
                };

                if (item.header.length === item.align.length) {
                    src = src.substring(cap[0].length);

                    for (i = 0; i < item.align.length; i++) {
                        if (/^ *-+: *$/.test(item.align[i])) {
                            item.align[i] = 'right';
                        } else if (/^ *:-+: *$/.test(item.align[i])) {
                            item.align[i] = 'center';
                        } else if (/^ *:-+ *$/.test(item.align[i])) {
                            item.align[i] = 'left';
                        } else {
                            item.align[i] = null;
                        }
                    }

                    for (i = 0; i < item.cells.length; i++) {
                        item.cells[i] = helpers.splitCells(item.cells[i], item.header.length);
                    }

                    this.tokens.push(item);

                    continue;
                }
            }

            // hr
            if (cap = this.rules.hr.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push(<Itoken>{
                    type: 'hr'
                });
                continue;
            }

            // blockquote
            if (cap = this.rules.blockquote.exec(src)) {
                src = src.substring(cap[0].length);

                this.tokens.push(<Itoken>{
                    type: 'blockquote_start'
                });

                cap = cap[0].replace(/^ *> ?/gm, '');

                // Pass `top` to keep the current
                // "toplevel" state. This is exactly
                // how markdown.pl works.
                this.token(cap, top);

                this.tokens.push(<Itoken>{
                    type: 'blockquote_end'
                });

                continue;
            }

            // list
            if (cap = this.rules.list.exec(src)) {
                src = src.substring(cap[0].length);
                bull = cap[2];
                isordered = bull.length > 1;

                listStart = {
                    type: 'list_start',
                    ordered: isordered,
                    start: isordered ? +bull : '',
                    loose: false
                };

                this.tokens.push(listStart);

                // Get each top-level item.
                cap = cap[0].match(this.rules.item);

                listItems = [];
                next = false;
                l = cap.length;
                i = 0;

                for (; i < l; i++) {
                    item = cap[i];

                    // Remove the list item's bullet
                    // so it is seen as the next token.
                    space = item.length;
                    item = item.replace(/^ *([*+-]|\d+\.) */, '');

                    // Outdent whatever the
                    // list item contains. Hacky.
                    if (~item.indexOf('\n ')) {
                        space -= item.length;
                        item = !this.options.pedantic
                            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
                            : item.replace(/^ {1,4}/gm, '');
                    }

                    // Determine whether the next list item belongs here.
                    // Backpedal if it does not belong in this list.
                    if (i !== l - 1) {
                        b = block.bullet.exec(cap[i + 1])[0];
                        if (bull.length > 1 ? b.length === 1
                            : (b.length > 1 || (this.options.smartLists && b !== bull))) {
                            src = cap.slice(i + 1).join('\n') + src;
                            i = l - 1;
                        }
                    }

                    // Determine whether item is loose or not.
                    // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
                    // for discount behavior.
                    loose = next || /\n\n(?!\s*$)/.test(item);
                    if (i !== l - 1) {
                        next = item.charAt(item.length - 1) === '\n';
                        if (!loose) loose = next;
                    }

                    if (loose) {
                        listStart.loose = true;
                    }

                    // Check for task list items
                    istask = /^\[[ xX]\] /.test(item);
                    ischecked = undefined;
                    if (istask) {
                        ischecked = item[1] !== ' ';
                        item = item.replace(/^\[[ xX]\] +/, '');
                    }

                    t = {
                        type: 'list_item_start',
                        task: istask,
                        checked: ischecked,
                        loose: loose
                    };

                    listItems.push(t);
                    this.tokens.push(t);

                    // Recurse.
                    this.token(item, false);

                    this.tokens.push(<Itoken>{
                        type: 'list_item_end'
                    });
                }

                if (listStart.loose) {
                    l = listItems.length;
                    i = 0;
                    for (; i < l; i++) {
                        listItems[i].loose = true;
                    }
                }

                this.tokens.push(<Itoken>{
                    type: 'list_end'
                });

                continue;
            }

            // html
            if (cap = this.rules.html.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push(<Itoken>{
                    type: this.options.sanitize
                        ? 'paragraph'
                        : 'html',
                    pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
                    text: cap[0]
                });
                continue;
            }

            // def
            if (top && (cap = this.rules.def.exec(src))) {
                src = src.substring(cap[0].length);
                if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
                tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
                if (!(<any>this.tokens).links[tag]) {
                    (<any>this.tokens).links[tag] = {
                        href: cap[2],
                        title: cap[3]
                    };
                }
                continue;
            }

            // table (gfm)
            if (top && (cap = this.rules.table.exec(src))) {
                item = {
                    type: 'table',
                    header: helpers.splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
                    align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                    cells: cap[3] ? cap[3].replace(/(?: *\| *)?\n$/, '').split('\n') : []
                };

                if (item.header.length === item.align.length) {
                    src = src.substring(cap[0].length);

                    for (i = 0; i < item.align.length; i++) {
                        if (/^ *-+: *$/.test(item.align[i])) {
                            item.align[i] = 'right';
                        } else if (/^ *:-+: *$/.test(item.align[i])) {
                            item.align[i] = 'center';
                        } else if (/^ *:-+ *$/.test(item.align[i])) {
                            item.align[i] = 'left';
                        } else {
                            item.align[i] = null;
                        }
                    }

                    for (i = 0; i < item.cells.length; i++) {
                        item.cells[i] = helpers.splitCells(
                            item.cells[i].replace(/^ *\| *| *\| *$/g, ''),
                            item.header.length);
                    }

                    this.tokens.push(item);

                    continue;
                }
            }

            // lheading
            if (cap = this.rules.lheading.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push(<Itoken>{
                    type: 'heading',
                    depth: cap[2] === '=' ? 1 : 2,
                    text: cap[1]
                });
                continue;
            }

            // top-level paragraph
            if (top && (cap = this.rules.paragraph.exec(src))) {
                src = src.substring(cap[0].length);
                this.tokens.push(<Itoken>{
                    type: 'paragraph',
                    text: cap[1].charAt(cap[1].length - 1) === '\n'
                        ? cap[1].slice(0, -1)
                        : cap[1]
                });
                continue;
            }

            // text
            if (cap = this.rules.text.exec(src)) {
                // Top-level should never reach here.
                src = src.substring(cap[0].length);
                this.tokens.push(<Itoken>{
                    type: 'text',
                    text: cap[0]
                });
                continue;
            }

            if (src) {
                throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
            }
        }

        return this.tokens;
    }
}