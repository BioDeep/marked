namespace markedjs {

    export interface Imarked {

        options: option;

        (src: string, opt?: option, callback?: markedCallback): string;

        setOptions(opt: option): void;
        parse: Imarked;
    }

    export interface markedCallback {
        (err: string, output?: string): void;
    }
}