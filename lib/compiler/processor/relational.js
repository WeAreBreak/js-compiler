/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "relational";
    },

    process: function(leaf, state) {
        for(var i = 0; i < leaf.items.length; ++i) {
            state.processor.leaf(leaf.items[i], state);
        }
    }

};