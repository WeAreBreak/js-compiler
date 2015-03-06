/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "group";
    },

    process: function(leaf, state) {
        state.print("(");
        state.processor.leaf(leaf.expression, state);
        state.print(")");
    }

};