import { getJSDocReturnTag } from "typescript";

var globalCounter = 0;

function increace() {
    globalCounter += 1;
}

increace();

export default {
    increateCounter() {
        increace();
    },
    getCount() {
        return globalCounter;
    }
}