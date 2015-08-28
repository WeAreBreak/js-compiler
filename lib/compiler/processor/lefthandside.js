/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "lefthandside";
    },

    process: function(leaf, state) {
        if(leaf.items.length == 2 && leaf.items[1].type == "arguments") {
            state.print("[ ");

            if(leaf.items[1].items.length) {
                state.pushContext("function-call-identifier-with-arguments");
                state.processor.leaf(leaf.items[0], state);
                state.popContext("function-call-identifier-with-arguments");

                state.print(', ');
                state.processor.leaf(leaf.items[1], state);
            }
            else {
                state.pushContext("function-call-identifier");
                state.processor.leaf(leaf.items[0], state);
                state.popContext("function-call-identifier");
            }

            state.print(" ]");
        }
        else {
            for (i = 0; i < leaf.items.length; ++i) {
                state.processor.leaf(leaf.items[i], state);
                //if (i != leaf.items.length - 1) state.print(',m ');
            }
        }
    }

};