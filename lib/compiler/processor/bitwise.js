/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "bitwise";
    },

    process: function(leaf, state) {
        var separator = "";
        if(leaf.subtype === "or") separator = "|";
        else if(leaf.subtype === "and") separator = "&";
        else if(leaf.subtype === "xor") separator = "^";

        for(var i = 0; i < leaf.items.length; ++i) {
            state.processor.leaf(leaf.items[i], state);
            if(i != leaf.items.length-1) state.print(separator);
        }
    }

};