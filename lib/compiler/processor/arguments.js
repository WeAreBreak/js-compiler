/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// private methods ///
var utils = {

    arguments: function(leaf, state) {
        state.print("(");

        for(var i = 0; i < leaf.items.length; ++i) {
            state.processor.leaf(leaf.items[i], state);
            if(i != leaf.items.length - 1) state.print(', ');
        }

        state.print(")");
    }

};

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "arguments";
    },

    process: function(leaf, state) {
        utils.arguments(leaf, state);
    }

};