/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "additive";
    },

    process: function(leaf, state) {
        if(leaf.items.length > 1) {
            state.print("[");
            state.processor.leaf(leaf.items[1], state);
            state.print(", ");
            state.processor.leaf(leaf.items[0], state);
            state.print(", ");
            state.processor.leaf(leaf.items[2], state);
            state.print("]");
        }
        else {
            for(var i = 0; i < leaf.items.length; ++i) {
                state.processor.leaf(leaf.items[i], state);
            }
        }
    }

};