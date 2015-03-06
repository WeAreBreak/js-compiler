/**
 * Throw Statement Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "labelled";
    },

    process: function(leaf, state) {
        state.print(leaf.name + ": ");
        state.processor.leaf(leaf.statement, state);
        //state.println(";")
    }

};