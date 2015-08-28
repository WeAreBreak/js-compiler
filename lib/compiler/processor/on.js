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
        return leaf.type === "on";
    },

    process: function(leaf, state) {
        state.print('[10,10,[["');
        state.print(leaf.name);
        state.print('"');

        if(leaf.expression) {
            state.print(', ');
            state.processor.leaf(leaf.expression, state);
        }

        state.print("]");

        if(leaf.items.length) state.print(', ');

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

        state.print("]]");
    }

};