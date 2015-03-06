/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "default";
    },

    process: function(leaf, state) {
        state.println("default: ");
        state.levelDown();
        state.processor.level(leaf.items, state);
        state.levelUp();
        state.line_break();
    }

};