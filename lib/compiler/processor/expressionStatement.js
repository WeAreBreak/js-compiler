/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "expressionStatement";
    },

    process: function(leaf, state) {
        state.processor.leaf(leaf.items[0], state);
        state.println(";")
    }

};