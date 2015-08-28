/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "iteration" && leaf.subtype === "while";
    },

    process: function(leaf, state) {
        state.print('[ ');
        state.print('"doUntil", ');

        state.print('["not",');
        state.processor.leaf(leaf.condition, state);
        state.print("], ");

        if(leaf.statement.type !== "block") state.print("[ ");
        state.processor.leaf(leaf.statement, state);
        if(leaf.statement.type !== "block") state.print(" ]");

        state.print('] ');
    }

};