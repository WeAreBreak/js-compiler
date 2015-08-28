/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "iteration" && leaf.subtype === "for";
    },

    process: function(leaf, state) {
        if(leaf.expressions[0]) {
            state.processor.leaf(leaf.expressions[0], state);
            state.print(', ');
        }

        state.print('[ ');
        state.print('"doUntil", ');

        state.print('["not",');
        if(leaf.expressions[1]) state.processor.leaf(leaf.expressions[1], state);
        else state.print('["=",1,1]');
        state.print("], ");

        state.print("[ ");
        if(leaf.statement.type !== "block") {
            state.processor.leaf(leaf.statement, state);
            state.print(', ');
        }
        else {
            state.processor.level(leaf.statement.items, state);
            if(leaf.statement.items.length) state.print(', ');
        }
        if(leaf.expressions[2]) state.processor.leaf(leaf.expressions[2], state);
        state.print(" ]");

        state.print(']');
    }

};