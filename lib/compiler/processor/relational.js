/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "relational";
    },

    process: function(leaf, state) {
        if(leaf.items.length == 1)
        {
            state.processor.leaf(leaf.items[0], state);
        }
        else {
            state.print("[ ");
            state.processor.leaf(leaf.items[1], state);
            state.print(", ");
            state.processor.leaf(leaf.items[0], state);
            state.print(", ");
            state.processor.leaf(leaf.items[2], state);
            state.print(" ]");
        }
    }

};