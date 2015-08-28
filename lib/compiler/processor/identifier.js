/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "identifier";
    },

    process: function(leaf, state) {

        if(leaf.name == "answer") {
            state.print('["answer"]');
        }
        else if(leaf.customBlock) {
            //["call", "test %n %s", 1, "hello"]
            state.print('"call","' + leaf.customBlock + '"');
        }
        else if(state.context == "function-call-identifier" || (state.context == "function-call-identifier-with-arguments" && leaf.name == "doAsk")) {
            state.print('"' + leaf.name + '"');
        }
        else if(state.context == "function-call-identifier-with-arguments") {
            state.print('"' + leaf.name + ':"');
        }
        else if(leaf.parameter) {
            state.print('["getParam", ');
            state.print('"' + (leaf.internalName || leaf.name) + '"]');
        }
        else {
            state.print('["readVariable", ');
            state.print('"' + (leaf.internalName || leaf.name) + '"]');
        }
    }

};