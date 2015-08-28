/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "variable" || leaf.type === "variableDeclarationList";
    },

    process: function(leaf, state) {
        state.print_indent();

        var scopeSpace = "";
        if(leaf.scope === "local") {
            state.print("var");
            state.meaningfulSpace();
            scopeSpace = "    ";
        }
        else if(leaf.scope === "block") {
            state.print("let");
            state.meaningfulSpace();
            scopeSpace = "    ";
        }
        else if(leaf.scope === "const") {
            state.print("const");
            state.meaningfulSpace();
            scopeSpace = "     ";
        }

        var item;
        for(var i = 0; i < leaf.items.length; ++i) {
            item = leaf.items[i];
            if(i != 0) state.print(scopeSpace);
            state.print(item.name);
            if(item.items.length) state.print(" = ");
            state.processor.level(item.items, state);
            if(i != leaf.items.length - 1) state.println(", ");
        }
        if(leaf.type === "variable") {
            state.print(";");
            if (leaf.items.length > 1) state.line_break();
            state.line_break();
        }
    }

};