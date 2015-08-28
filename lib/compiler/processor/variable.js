/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "variable" || leaf.type === "variableDeclarationList";
    },

    process: function(leaf, state) {
        if(leaf.global) {
            state.print('[10,10,[["whenGreenFlag"], ');
        }

        var item;
        for(var i = 0; i < leaf.items.length; ++i) {
            item = leaf.items[i];
            state.print('["setVar:to:", ');
            state.print('"' + item.internalName + '"');

                state.print(", ");

            if(item.items.length) {
                if(item.items.length == 1) state.processor.leaf(item.items[0], state);
                else {
                    state.print('[');
                    state.processor.level(item.items, state);
                    state.print(']');
                }
            }
            else {
                state.print('""');
            }

            state.print(']');
            if(i != leaf.items.length - 1) state.print(", ");
        }

        if(leaf.global) {
            state.print(']]');
        }
    }

};