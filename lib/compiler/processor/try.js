/**
 * Try Statement Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "try";
    },

    process: function(leaf, state) {
        state.print("try ");
        state.println("{");
        state.levelDown();
        state.processor.level(leaf.items[0].items, state);
        state.levelUp();
        state.println("}");
        leaf.items.shift();

        if(leaf.items[0] && leaf.items[0].type === "catch") {
            state.print("catch ");
            state.print("(");
            state.print(leaf.name);
            state.print(") ");
            state.println("{");
            state.levelDown();
            state.processor.level(leaf.items[0].items, state);
            state.levelUp();
            state.println("}");
            leaf.items.shift();
        }

        if(leaf.items[0] && leaf.items[0].type === "finally") {
            state.print("finally ");
            state.println("{");
            state.levelDown();
            state.processor.level(leaf.items[0].items, state);
            state.levelUp();
            state.println("}");
            leaf.items.shift();
        }
    }

};