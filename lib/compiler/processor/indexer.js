/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// private methods ///
var utils = {

    indexer: function(leaf, state) {
        state.print("[");
        state.processor.leaf(leaf.items[0], state);
        state.print("]");
    }

};

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "indexer";
    },

    process: function(leaf, state) {
        utils.indexer(leaf, state);
    }

};