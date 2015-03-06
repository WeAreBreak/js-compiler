/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "switch";
    },

    process: function(leaf, state) {
        state.print("switch ");
        state.print("(");
        state.processor.leaf(leaf.expression, state);
        state.print(") ");
        state.println("{");
        state.levelDown();
            state.processor.level(leaf.items, state);
        state.levelUp();
        state.println("}");
    }

};