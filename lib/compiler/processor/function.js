/**
 * Function Processor for the CellScript to JS Compiler.
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

/// public interface ///
module.exports = {

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(leaf) {
        return leaf.type === "function";
    },

    process: function(leaf, state) {
        state.print("function");
        if(leaf.generator) state.print("* ");
        else if(leaf.name) state.meaningfulSpace();
        state.print((leaf.name || "") + "(" + leaf.parameters.map(function(item) { return item.name }).join(', ') + ") ");
        state.println("{");
        state.pushContext(leaf);
        state.levelDown();

        ExtensionManager.inject("before-body", this, leaf, state);

        var result = ExtensionManager.inject("body", this, leaf, state);
            if(!result.hasResult) {
                state.processor.level(leaf.items, state);
            }

        ExtensionManager.inject("after-body", this, leaf, state);

        state.levelUp();
        state.popContext();

        if(leaf.isExpression) state.print("}");
        else {
            state.println("}");
            state.println("");
        }
    }

};