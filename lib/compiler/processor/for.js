/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "iteration" && leaf.subtype === "for";
    },

    process: function(leaf, state) {
        state.print("for ");
        state.print("(");
        if(leaf.expressions[0]) state.processor.leaf(leaf.expressions[0], state);
        state.print("; ");
        if(leaf.expressions[1]) state.processor.leaf(leaf.expressions[1], state);
        state.print("; ");
        if(leaf.expressions[2]) state.processor.leaf(leaf.expressions[2], state);
        state.print(") ");
        state.processor.leaf(leaf.statement, state);
    }

};