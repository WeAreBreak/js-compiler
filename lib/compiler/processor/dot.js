/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "dot";
    },

    process: function(leaf, state) {
        state.print("." + leaf.name);
    }

};