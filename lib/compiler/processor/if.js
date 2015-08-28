/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "if";
    },

    process: function(leaf, state) {

        state.print("[ ");

        if(leaf.statements[1]) state.print('"doIfElse"');
        else state.print('"doIf"');
        state.print(", ");

        state.processor.leaf(leaf.condition, state);
        state.print(", ");

        if(leaf.statements[0].type !== "block") state.print("[ ");
        state.processor.leaf(leaf.statements[0], state);
        if(leaf.statements[0].type !== "block") state.print(" ]");

        if (leaf.statements[1]) {
            state.print(", ");

            if(leaf.statements[1].type !== "block") state.print("[ ");
            state.processor.leaf(leaf.statements[1], state);
            if(leaf.statements[1].type !== "block") state.print(" ]");
        }

        state.print(" ]");
    }


};