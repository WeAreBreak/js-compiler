/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "break";
    },

    process: function(leaf, state) {
        if(leaf.label) { //TODO: Empty labels cause invalid meaningful space
            state.print("break");
            state.meaningfulSpace();
            state.processor.leaf(leaf.label, state);
            state.println(";")
        }
        else {
            state.print("break;");
        }
    }

};