namespace markedjs {

    export abstract class component {

        public options: option;

        public constructor(opt: option) {
            this.options = opt;
        }
    }
}