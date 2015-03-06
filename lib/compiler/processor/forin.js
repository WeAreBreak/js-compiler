/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "iteration" && leaf.subtype === "forin";
    },

    process: function(leaf, state) {
        state.print("for ");
        state.print("(");
        state.processor.leaf(leaf.expressions[0], state);
        state.meaningfulSpace();
        state.print("in");
        state.meaningfulSpace();
        state.processor.leaf(leaf.expressions[1], state);
        state.print(") ");
        state.processor.leaf(leaf.statement, state);
    }

};