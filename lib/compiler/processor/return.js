/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "return";
    },

    process: function(leaf, state) {
        state.print("return");
        if (leaf.expression) {
            state.meaningfulSpace();
            state.processor.leaf(leaf.expression, state);
        }
        state.println(";")
    }

};