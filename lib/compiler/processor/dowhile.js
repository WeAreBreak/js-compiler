/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "iteration" && leaf.subtype === "dowhile";
    },

    process: function(leaf, state) {
        state.print("do ");
        state.processor.leaf(leaf.statement, state);
        state.line_break();
        state.print("while ");
        state.print("(");
        state.processor.leaf(leaf.condition, state);
        state.println(");");
    }

};