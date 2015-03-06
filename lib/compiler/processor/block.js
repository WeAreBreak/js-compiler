/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "block";
    },

    process: function(leaf, state) {
        state.println("{");
        state.levelDown();
        state.processor.level(leaf.items, state);
        state.levelUp();
        state.print("}");
    }

};