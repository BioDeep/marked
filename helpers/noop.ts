module helpers {

    /**
     * 模拟正则表达式，因为正则表达式没有空操作，所以会需要用这个来进行模拟
    */
    export interface Inoop {
        (): void;
        /**
         * Execute regexp
        */
        exec: Inoop;
    }

    /**
     * No operation: this regexp object do nothing.
    */
    export const noop: Inoop = (function () {
        var empty: any = function noop(): void {
            // do nothing
        }
        empty.exec = empty;

        // This regexp do nothing
        return empty;
    })()
}