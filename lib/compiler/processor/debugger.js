/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "debugger";
    },

    process: function(leaf, state) {
        state.println("debugger;");
    }

};