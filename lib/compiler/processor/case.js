/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "case";
    },

    process: function(leaf, state) {
        state.print("case");
        state.meaningfulSpace();
        state.processor.leaf(leaf.expression, state);
        state.println(":");
        state.levelDown();
        state.processor.level(leaf.items, state);
        state.levelUp();
        state.line_break();
    }

};