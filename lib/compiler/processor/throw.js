/**
 * Throw Statement Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "throw";
    },

    process: function(leaf, state) {
        state.print("throw");
        state.meaningfulSpace();
        state.processor.leaf(leaf.expression, state);
        state.println(";");
    }

};