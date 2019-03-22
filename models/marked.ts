interface Imarked {

    options: option;

    (src: string, opt: option, callback: markedCallback): string;

    setOptions(opt: option): void;
    parse: Imarked;
}

interface markedCallback {
    (err: string, output?: string): void;
}