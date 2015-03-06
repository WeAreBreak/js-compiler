/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "if";
    },

    process: function(leaf, state) {
        state.print("if ");
        state.print("(");
        state.processor.leaf(leaf.condition, state);
        state.print(") ");
        state.processor.leaf(leaf.statements[0], state);
        if (leaf.statements[1]) {
            state.line_break();
            state.print("else");
            if(leaf.statements[1].type !== "block") state.meaningfulSpace();
            else state.print(" ");
            state.processor.leaf(leaf.statements[1], state);
        }
        state.line_break();
    }


};