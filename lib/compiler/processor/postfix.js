/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "postfix";
    },

    process: function(leaf, state) {
        if(leaf.subtype) {
            state.print('["changeVar:by:","');
            state.print(leaf.items[0].items[0].internalName || leaf.items[0].items[0].name);
            state.print('",');
            if (leaf.subtype == "++") state.print('1');
            else if (leaf.subtype == "--") state.print('-1');
            state.print(']');
        }
        else {
            state.processor.leaf(leaf.items[0], state);
        }
    }

};