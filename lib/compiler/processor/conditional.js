/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "conditional";
    },

    process: function(leaf, state) {
        if(leaf.subtype === "complex") {
            state.processor.leaf(leaf.items[0], state);
            state.print(" ? ");
            state.processor.leaf(leaf.items[1], state);
            state.print(" : ");
            state.processor.leaf(leaf.items[2], state);
        }
        else {
            state.processor.leaf(leaf.items[0], state);
        }
    }

};