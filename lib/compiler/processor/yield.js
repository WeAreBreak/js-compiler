/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "yield";
    },

    process: function(leaf, state) {
        state.print("yield");
        if(leaf.delegated) state.print("* ");
        if (leaf.expression) {
            if(!leaf.delegated) state.meaningfulSpace();
            state.processor.leaf(leaf.expression, state);
        }
        state.println(";");
    }

};