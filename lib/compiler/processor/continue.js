/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "continue";
    },

    process: function(leaf, state) {
        if(leaf.label) { //TODO: Empty labels cause invalid meaningful space
            state.print("continue");
            state.meaningfulSpace();
            state.processor.leaf(leaf.label, state);
            state.println(";")
        }
        else {
            state.print("continue;");
        }
    }

};